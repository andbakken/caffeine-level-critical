import pg from "pg";
import { env } from "./env.js";
import { registryPool } from "./registry.js";
import { dbNameFor } from "./validate.js";

// Global bruksstatistikk. Vi teller totalt antall loggede kopper på tvers av ALLE
// hostede tenants, men persisterer KUN ett anonymt aggregat (sum + antall tenants).
// Ingen per-tenant-, per-bruker- eller per-kopp-data lagres → anonym statistikk,
// ikke personopplysninger (GDPR fortale 26). Se planen for personvernbegrunnelse.

export type GlobalStat = {
  totalCups: number;
  tenantCount: number;
  capturedAt: Date;
};

export async function initStats(): Promise<void> {
  await registryPool.query(`
    CREATE TABLE IF NOT EXISTS global_stats (
      id           SERIAL PRIMARY KEY,
      captured_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      total_cups   BIGINT NOT NULL,
      tenant_count INTEGER NOT NULL
    );
  `);
}

// Leser SUM("quantity") fra én tenant-DB som superuser. Kort statement_timeout og
// alltid lukket klient. Kaster ved feil – kalleren avgjør om det skal hoppes over.
async function cupsForTenant(subdomain: string): Promise<number> {
  const client = new pg.Client({
    host: env.pg.host,
    user: env.pg.superUser,
    password: env.pg.superPassword,
    database: dbNameFor(subdomain),
    statement_timeout: 5_000,
  });
  await client.connect();
  try {
    // KUN aggregat. Aldri per-bruker-rader, tidsstempler, nickname eller email.
    const { rows } = await client.query(
      `SELECT COALESCE(SUM("quantity"), 0)::bigint AS cups FROM "Consumption"`,
    );
    return Number(rows[0]?.cups ?? 0);
  } finally {
    await client.end();
  }
}

/**
 * Summerer kopper på tvers av alle aktive tenants og lagrer ett globalt aggregat.
 * Feil på én tenant logges og hoppes over – skal ikke velte hele kjøringen.
 */
export async function collectGlobalTotal(): Promise<number> {
  const { rows } = await registryPool.query<{ subdomain: string }>(
    "SELECT subdomain FROM tenants WHERE status = 'active'",
  );

  let total = 0;
  let counted = 0;
  for (const { subdomain } of rows) {
    try {
      total += await cupsForTenant(subdomain);
      counted++;
    } catch (err) {
      console.error(`Statistikk: klarte ikke telle kopper for ${subdomain}:`, err);
    }
  }

  await registryPool.query(
    "INSERT INTO global_stats (total_cups, tenant_count) VALUES ($1, $2)",
    [total, counted],
  );
  console.log(`📊 Global kopp-total: ${total} (${counted} tenants)`);
  return total;
}

export async function latestTotal(): Promise<GlobalStat | null> {
  const { rows } = await registryPool.query(
    "SELECT total_cups, tenant_count, captured_at FROM global_stats ORDER BY id DESC LIMIT 1",
  );
  const r = rows[0];
  if (!r) return null;
  return {
    totalCups: Number(r.total_cups),
    tenantCount: Number(r.tenant_count),
    capturedAt: r.captured_at as Date,
  };
}
