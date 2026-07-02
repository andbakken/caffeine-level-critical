import express from "express";
import type Stripe from "stripe";
import { env, standardPrice } from "./env.js";
import { stripe } from "./stripe.js";
import {
  initRegistry,
  findBySubdomain,
  findBySubscription,
  findByStatuses,
  upsertTenant,
} from "./registry.js";
import { validateSubdomain, dbNameFor } from "./validate.js";
import { provisionTenant, pauseTenant, notifyOwner } from "./provision.js";
import { initStats, collectGlobalTotal, latestTotal } from "./stats.js";
import { rateLimit, clientIp } from "./rateLimit.js";

const app = express();

// ── Stripe-webhook: rå body KREVES for signaturverifisering (før express.json). ──
app.post("/stripe/webhook", express.raw({ type: "*/*" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, env.stripe.webhookSecret);
  } catch (err) {
    console.error("Ugyldig webhook-signatur:", err);
    return res.status(400).send("invalid signature");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const md = s.metadata ?? {};
        const subdomain = md.subdomain;
        if (!subdomain) break;

        const customerId = typeof s.customer === "string" ? s.customer : null;
        const subscriptionId = typeof s.subscription === "string" ? s.subscription : null;

        // Vern mot subdomene-kapring: ledighet sjekkes når Checkout-sesjonen LAGES,
        // men to åpne sesjoner kan kappes om samme subdomene. Hvis subdomenet allerede
        // eies av en ANNEN Stripe-kunde, skal vi ikke overskrive den eksisterende
        // tenanten (ellers kan en fremmeds oppsigelse pause feil selskaps instans).
        const existing = await findBySubdomain(subdomain);
        if (
          existing &&
          existing.status !== "deprovisioning" &&
          existing.stripeCustomerId &&
          customerId &&
          existing.stripeCustomerId !== customerId
        ) {
          console.warn(
            `⚠ Subdomene-kollisjon: ${subdomain} eies av ${existing.stripeCustomerId}, ` +
              `ny betaling fra ${customerId}. Kansellerer det nye abonnementet.`,
          );
          if (subscriptionId) {
            await stripe.subscriptions.cancel(subscriptionId).catch((e) =>
              console.error("Klarte ikke kansellere kollisjons-abonnement:", e),
            );
          }
          await notifyOwner(
            `Subdomene-kollisjon: ${subdomain}`,
            `To kunder forsøkte å ta subdomenet <strong>${subdomain}</strong>.<br>` +
              `Eksisterende kunde: ${existing.stripeCustomerId}<br>` +
              `Ny (avvist + kansellert): ${customerId} / ${md.email ?? "?"}<br>` +
              `Det nye abonnementet er kansellert med prorata-refusjon. Følg opp kunden manuelt.`,
          ).catch(() => {});
          break; // rør ikke den eksisterende tenanten
        }

        const tenant = await upsertTenant({
          subdomain,
          orgName: md.orgName ?? subdomain,
          adminEmail: md.email ?? (s.customer_email ?? ""),
          dbName: dbNameFor(subdomain),
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        });
        // Svar 200 raskt; provisjoner i bakgrunnen (idempotent, så trygt ved retry).
        provisionTenant(tenant).catch((e) => console.error(`Provisjonering feilet (${subdomain}):`, e));
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const tenant = await findBySubscription(sub.id);
        if (tenant) await pauseTenant(tenant.subdomain);
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object;
        // Stripe Smart Retries prøver kortet flere ganger. `next_payment_attempt = null`
        // betyr at Stripe har gitt opp → vedvarende mislighold, så vi pauser instansen.
        // Ellers logger vi bare og lar Stripe (og kundens egne varsler) gjøre jobben.
        if (inv.next_payment_attempt == null) {
          const subId = typeof inv.subscription === "string" ? inv.subscription : null;
          const tenant = subId ? await findBySubscription(subId) : null;
          if (tenant && tenant.status === "active") {
            await pauseTenant(tenant.subdomain);
            console.warn(`⏸ Pauset ${tenant.subdomain} etter endelig betalingsmislighold.`);
            await notifyOwner(
              `Betaling misligholdt: ${tenant.subdomain}`,
              `Instansen <strong>${tenant.subdomain}</strong> (${tenant.adminEmail}) er pauset ` +
                `etter at Stripe ga opp å belaste kortet. Følg opp ved behov.`,
            ).catch(() => {});
          }
        } else {
          console.warn("Betaling feilet (Stripe prøver igjen):", inv.id);
        }
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook-håndtering feilet:", err);
    res.status(500).send("handler error");
  }
});

app.use(express.json());

// 14 dagers gratis prøveperiode: kortet samles inn nå, men belastes først etter
// prøvetiden. Kunden kan si opp gratis når som helst før. Hold i sync med copy-teksten
// «14 dager» i messages/*.json.
const TRIAL_DAYS = 14;

// ── Onboarding: opprett Checkout-sesjon. Kalles fra marketing-siden. ──
app.post("/checkout", async (req, res) => {
  // Rate-limit per IP (marketing-proxyen videresender X-Forwarded-For): hindrer spam
  // av Stripe-sesjoner og enumerering av opptatte subdomener via 409.
  if (!rateLimit(`checkout:${clientIp(req)}`, 10, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "For mange forsøk – prøv igjen om litt." });
  }

  const { orgName, subdomain, email } = req.body ?? {};
  if (!orgName || !email) return res.status(400).json({ error: "Fyll inn organisasjon og e-post." });

  // Klipp inputlengder før noe brukes videre.
  const orgNameStr = String(orgName).slice(0, 80).trim();
  const emailStr = String(email).slice(0, 254).trim();
  if (!orgNameStr || !emailStr) return res.status(400).json({ error: "Fyll inn organisasjon og e-post." });

  const sub = validateSubdomain(String(subdomain ?? ""));
  if (!sub.ok) return res.status(400).json({ error: sub.error });

  const existing = await findBySubdomain(sub.value);
  if (existing && existing.status !== "deprovisioning") {
    return res.status(409).json({ error: "Subdomenet er allerede i bruk." });
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: standardPrice(), quantity: 1 }],
      customer_email: emailStr,
      metadata: { subdomain: sub.value, orgName: orgNameStr, email: emailStr },
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { subdomain: sub.value, orgName: orgNameStr, email: emailStr },
      },
      success_url: `https://${env.baseDomain}/velkommen?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://${env.baseDomain}/`,
    });
  } catch (err) {
    console.error("Klarte ikke lage Checkout-sesjon:", err);
    return res.status(500).json({ error: "Kunne ikke starte betaling." });
  }
  res.json({ url: session.url });
});

app.get("/healthz", (_req, res) => res.json({ ok: true }));

// ── Aggregert bruksstatistikk (kun globalt totaltall). Beskyttet med delt token. ──
app.get("/internal/stats", async (req, res) => {
  if (!env.statsToken || req.headers["x-stats-token"] !== env.statsToken) {
    return res.status(404).send("not found");
  }
  const stat = await latestTotal();
  if (!stat) return res.json({ totalCups: 0, tenantCount: 0, capturedAt: null });
  res.json(stat);
});

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

// Kjør innsamlingen trygt: en feilet kjøring skal aldri velte prosessen.
function runCollection(): void {
  collectGlobalTotal().catch((e) => console.error("Statistikk-kjøring feilet:", e));
}

// Retry ufullførte provisjoneringer. provisionTenant er idempotent, så det er trygt å
// kjøre på nytt for tenants som står i «provisioning» (avbrutt) eller «failed» (feilet).
async function retryPendingProvisioning(): Promise<void> {
  const pending = await findByStatuses(["provisioning", "failed"]);
  for (const t of pending) {
    console.log(`↻ Prøver provisjonering på nytt: ${t.subdomain}`);
    await provisionTenant(t).catch(() => {}); // feil varsles allerede inne i provisionTenant
  }
}

function runRetry(): void {
  retryPendingProvisioning().catch((e) => console.error("Retry-kjøring feilet:", e));
}

Promise.all([initRegistry(), initStats()])
  .then(() => {
    app.listen(env.port, () => console.log(`Control plane lytter på :${env.port}`));
    runCollection(); // én gang ved oppstart
    setInterval(runCollection, DAY_MS);
    runRetry(); // fang opp tenants som ble avbrutt før en restart
    setInterval(runRetry, HOUR_MS);
  })
  .catch((e) => {
    console.error("Oppstart feilet:", e);
    process.exit(1);
  });
