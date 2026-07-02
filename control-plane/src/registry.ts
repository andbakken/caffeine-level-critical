import pg from "pg";
import { env } from "./env.js";

// Control-plane sin egen registry-DB. Holder styr på hver tenant: subdomene,
// Stripe-id-er, status, DB-navn. Eneste varige tilstanden vi selv eier.

export const registryPool = new pg.Pool({ connectionString: env.controlPlaneDatabaseUrl });

export type TenantStatus =
  | "provisioning"
  | "active"
  | "paused"
  | "failed"
  | "deprovisioning";

export type Tenant = {
  id: number;
  subdomain: string;
  orgName: string;
  adminEmail: string;
  dbName: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: TenantStatus;
};

export async function initRegistry(): Promise<void> {
  await registryPool.query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id                     SERIAL PRIMARY KEY,
      subdomain              TEXT UNIQUE NOT NULL,
      org_name               TEXT NOT NULL,
      admin_email            TEXT NOT NULL,
      db_name                TEXT NOT NULL,
      stripe_customer_id     TEXT,
      stripe_subscription_id TEXT,
      status                 TEXT NOT NULL DEFAULT 'provisioning',
      created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

function rowToTenant(r: Record<string, unknown>): Tenant {
  return {
    id: r.id as number,
    subdomain: r.subdomain as string,
    orgName: r.org_name as string,
    adminEmail: r.admin_email as string,
    dbName: r.db_name as string,
    stripeCustomerId: (r.stripe_customer_id as string) ?? null,
    stripeSubscriptionId: (r.stripe_subscription_id as string) ?? null,
    status: r.status as TenantStatus,
  };
}

export async function findBySubdomain(subdomain: string): Promise<Tenant | null> {
  const { rows } = await registryPool.query("SELECT * FROM tenants WHERE subdomain = $1", [subdomain]);
  return rows[0] ? rowToTenant(rows[0]) : null;
}

export async function findBySubscription(subId: string): Promise<Tenant | null> {
  const { rows } = await registryPool.query(
    "SELECT * FROM tenants WHERE stripe_subscription_id = $1",
    [subId],
  );
  return rows[0] ? rowToTenant(rows[0]) : null;
}

export async function upsertTenant(t: {
  subdomain: string;
  orgName: string;
  adminEmail: string;
  dbName: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}): Promise<Tenant> {
  const { rows } = await registryPool.query(
    `INSERT INTO tenants (subdomain, org_name, admin_email, db_name, stripe_customer_id, stripe_subscription_id, status)
     VALUES ($1,$2,$3,$4,$5,$6,'provisioning')
     ON CONFLICT (subdomain) DO UPDATE SET
       stripe_customer_id = EXCLUDED.stripe_customer_id,
       stripe_subscription_id = EXCLUDED.stripe_subscription_id
     RETURNING *`,
    [t.subdomain, t.orgName, t.adminEmail, t.dbName, t.stripeCustomerId, t.stripeSubscriptionId],
  );
  return rowToTenant(rows[0]);
}

export async function setStatus(subdomain: string, status: TenantStatus): Promise<void> {
  await registryPool.query("UPDATE tenants SET status = $1 WHERE subdomain = $2", [status, subdomain]);
}

/** Alle tenants med en av de oppgitte statusene. Brukes av retry-løkka. */
export async function findByStatuses(statuses: TenantStatus[]): Promise<Tenant[]> {
  const { rows } = await registryPool.query("SELECT * FROM tenants WHERE status = ANY($1)", [statuses]);
  return rows.map(rowToTenant);
}

/** Fjerner tenant-raden fra registry (siste steg i deprovisjonering). */
export async function deleteTenant(subdomain: string): Promise<void> {
  await registryPool.query("DELETE FROM tenants WHERE subdomain = $1", [subdomain]);
}
