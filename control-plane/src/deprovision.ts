import pg from "pg";
import Docker from "dockerode";
import { env } from "./env.js";
import { dbNameFor, dbRoleFor, containerNameFor } from "./validate.js";
import { registryPool, findBySubdomain, setStatus, deleteTenant } from "./registry.js";

// Manuell deprovisjonering: fjerner ALT for én tenant (container, volum, database,
// rolle, registry-rad). Bevisst manuell – sletting skal være en menneskelig beslutning.
//
//   docker exec <control-plane> npx tsx src/deprovision.ts <subdomain>         # dry-run
//   docker exec <control-plane> npx tsx src/deprovision.ts <subdomain> --yes   # utfør
//
// Merk: backupen (pg_dumpall) inneholder fortsatt tenanten inntil restic-rotasjonen
// (30 dager) har passert. Reell sletting = dette skriptet + 30 dager.

const docker = new Docker();

async function main() {
  const [subdomain, flag] = process.argv.slice(2);
  const apply = flag === "--yes";

  if (!subdomain) {
    console.error("Bruk: npx tsx src/deprovision.ts <subdomain> [--yes]");
    process.exit(1);
  }

  const containerName = containerNameFor(subdomain);
  const volumeName = `${containerName}-uploads`;
  const dbName = dbNameFor(subdomain);
  const role = dbRoleFor(subdomain);

  const tenant = await findBySubdomain(subdomain);
  console.log(`Tenant: ${subdomain}${tenant ? ` (status ${tenant.status})` : " (ikke i registry)"}`);
  console.log("Vil fjerne:");
  console.log(`  • container  ${containerName}`);
  console.log(`  • volum      ${volumeName}`);
  console.log(`  • database   ${dbName}`);
  console.log(`  • rolle      ${role}`);
  console.log(`  • registry-rad for ${subdomain}`);

  if (!apply) {
    console.log("\n(dry-run – ingenting ble endret. Kjør med --yes for å utføre.)");
    await registryPool.end();
    return;
  }

  if (tenant) await setStatus(subdomain, "deprovisioning").catch(() => {});

  // 1) Container (stopp + fjern). Idempotent.
  try {
    await docker.getContainer(containerName).remove({ force: true });
    console.log(`✔ Fjernet container ${containerName}`);
  } catch {
    console.log(`– Container ${containerName} fantes ikke`);
  }

  // 2) Volum. Idempotent.
  try {
    await docker.getVolume(volumeName).remove({ force: true });
    console.log(`✔ Fjernet volum ${volumeName}`);
  } catch {
    console.log(`– Volum ${volumeName} fantes ikke`);
  }

  // 3) Database + rolle. Identifikatorer stammer fra validert subdomene → trygge.
  const admin = new pg.Client({
    host: env.pg.host,
    user: env.pg.superUser,
    password: env.pg.superPassword,
    database: "postgres",
  });
  await admin.connect();
  try {
    // Terminer aktive tilkoblinger så DROP DATABASE ikke blokkeres.
    await admin.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [dbName],
    );
    await admin.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`✔ Slettet database ${dbName}`);
    await admin.query(`DROP ROLE IF EXISTS "${role}"`);
    console.log(`✔ Slettet rolle ${role}`);
  } finally {
    await admin.end();
  }

  // 4) Registry-rad.
  await deleteTenant(subdomain);
  console.log(`✔ Fjernet registry-rad for ${subdomain}`);

  await registryPool.end();
  console.log(`\n✅ Deprovisjonerte ${subdomain}.`);
}

main().catch(async (e) => {
  console.error("Deprovisjonering feilet:", e);
  await registryPool.end().catch(() => {});
  process.exit(1);
});
