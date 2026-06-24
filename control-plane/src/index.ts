import express from "express";
import type Stripe from "stripe";
import { env, priceForPlan, type Plan } from "./env.js";
import { stripe } from "./stripe.js";
import { initRegistry, findBySubdomain, findBySubscription, upsertTenant } from "./registry.js";
import { validateSubdomain, dbNameFor } from "./validate.js";
import { provisionTenant, pauseTenant } from "./provision.js";

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
        const tenant = await upsertTenant({
          subdomain,
          orgName: md.orgName ?? subdomain,
          adminEmail: md.email ?? (s.customer_email ?? ""),
          dbName: dbNameFor(subdomain),
          stripeCustomerId: typeof s.customer === "string" ? s.customer : null,
          stripeSubscriptionId: typeof s.subscription === "string" ? s.subscription : null,
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
        // MVP: logg. Grace-periode + pause ved vedvarende mislighold håndteres senere.
        console.warn("Betaling feilet:", event.data.object.id);
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

// ── Onboarding: opprett Checkout-sesjon. Kalles fra marketing-siden. ──
app.post("/checkout", async (req, res) => {
  const { orgName, subdomain, email, plan } = req.body ?? {};
  if (!orgName || !email) return res.status(400).json({ error: "Fyll inn organisasjon og e-post." });

  const sub = validateSubdomain(String(subdomain ?? ""));
  if (!sub.ok) return res.status(400).json({ error: sub.error });

  const existing = await findBySubdomain(sub.value);
  if (existing && existing.status !== "deprovisioning") {
    return res.status(409).json({ error: "Subdomenet er allerede i bruk." });
  }

  const chosenPlan: Plan = plan === "team" ? "team" : "standard";
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceForPlan(chosenPlan), quantity: 1 }],
      customer_email: String(email),
      metadata: { subdomain: sub.value, orgName: String(orgName), email: String(email), plan: chosenPlan },
      subscription_data: {
        metadata: { subdomain: sub.value, orgName: String(orgName), email: String(email) },
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

initRegistry()
  .then(() => app.listen(env.port, () => console.log(`Control plane lytter på :${env.port}`)))
  .catch((e) => {
    console.error("Oppstart feilet:", e);
    process.exit(1);
  });
