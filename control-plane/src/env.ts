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
    priceTeam: process.env.STRIPE_PRICE_TEAM ?? "",
  },
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  mailFrom: process.env.MAIL_FROM ?? "no-reply@localhost",
  port: Number(process.env.PORT ?? 8080),
};

export type Plan = "standard" | "team";

export function priceForPlan(plan: Plan): string {
  const id = plan === "team" ? env.stripe.priceTeam : env.stripe.priceStandard;
  if (!id) throw new Error(`Ingen Stripe-pris konfigurert for plan: ${plan}`);
  return id;
}
