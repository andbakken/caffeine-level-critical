// Sentralisert, validert miljøkonfig. Kaster tidlig hvis noe kritisk mangler.

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Mangler miljøvariabel: ${name}`);
  return v;
}

export const env = {
  controlPlaneDatabaseUrl: req("CONTROL_PLANE_DATABASE_URL"),
  pg: {
    host: process.env.POSTGRES_HOST ?? "postgres",
    superUser: req("POSTGRES_SUPER_USER"),
    superPassword: req("POSTGRES_SUPER_PASSWORD"),
  },
  baseDomain: req("BASE_DOMAIN"),
  tenantImage: req("TENANT_IMAGE"),
  edgeNetwork: process.env.EDGE_NETWORK ?? "bq_edge",
  dataNetwork: process.env.DATA_NETWORK ?? "bq_data",
  stripe: {
    secretKey: req("STRIPE_SECRET_KEY"),
    webhookSecret: req("STRIPE_WEBHOOK_SECRET"),
    priceStandard: process.env.STRIPE_PRICE_STANDARD ?? "",
  },
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  mailFrom: process.env.MAIL_FROM ?? "no-reply@localhost",
  ownerEmail: process.env.OWNER_EMAIL ?? "", // driftsvarsler (provisjoneringsfeil, subdomene-kollisjon). Tom = kun logg.
  statsToken: process.env.STATS_TOKEN ?? "", // beskytter GET /internal/stats; tom = ruten av
  // Ressurstak per tenant-container (idle ~150–250 MB; tak, ikke reservasjon).
  tenantMemoryMb: Number(process.env.TENANT_MEMORY_MB ?? 768),
  tenantCpus: Number(process.env.TENANT_CPUS ?? 1),
  port: Number(process.env.PORT ?? 8080),
};

export function standardPrice(): string {
  if (!env.stripe.priceStandard) throw new Error("Ingen Stripe-pris konfigurert (STRIPE_PRICE_STANDARD)");
  return env.stripe.priceStandard;
}
