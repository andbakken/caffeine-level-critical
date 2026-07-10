import { env } from "./env.js";
import { registryPool, upsertTenant, setStatus } from "./registry.js";
import { dbNameFor } from "./validate.js";
import { ensureDatabase, ensureContainer } from "./provision.js";

// Provisjonerer den offentlige demo-instansen (demo.<domene>) — én gang, idempotent.
// Som provisionTenant, men uten Stripe og uten velkomst-e-post. Containeren får
// DEMO_MODE=1 automatisk (se ensureContainer): simulerte kolleger, gjeste-innlogging
// og nattlig reset. Full oppskrift: infra/DEMO.md.
//
//   docker exec <control-plane> npx tsx src/provision-demo.ts

const SUBDOMAIN = "demo";

async function main() {
  if (!env.ownerEmail) {
    console.error("OWNER_EMAIL må være satt (brukes som admin-e-post for demoen).");
    process.exit(1);
  }

  await upsertTenant({
    subdomain: SUBDOMAIN,
    orgName: "Demo-kontoret",
    adminEmail: env.ownerEmail,
    dbName: dbNameFor(SUBDOMAIN),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
  });

  const { dbUrl } = await ensureDatabase(SUBDOMAIN);
  await ensureContainer(SUBDOMAIN, env.ownerEmail, dbUrl);
  await setStatus(SUBDOMAIN, "active");

  console.log(`✅ Demo-instansen kjører på https://${SUBDOMAIN}.${env.baseDomain}`);
  console.log("   Husk DEMO_URL på apex (compose) så demo-seksjonen vises på markedssiden.");
  await registryPool.end();
}

main().catch(async (e) => {
  console.error("Demo-provisjonering feilet:", e);
  await registryPool.end().catch(() => {});
  process.exit(1);
});
