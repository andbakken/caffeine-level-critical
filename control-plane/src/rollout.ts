import Docker from "dockerode";
import { containerNameFor } from "./validate.js";
import {
  registryPool,
  findByStatuses,
  findBySubdomain,
  type Tenant,
} from "./registry.js";
import { ensureContainer } from "./provision.js";

// Rullende oppgradering av tenant-containere til gjeldende TENANT_IMAGE.
// I motsetning til re-provisjonering: ingen velkomst-e-post, ingen passord-rotasjon
// (gjenbruker eksisterende DATABASE_URL fra den kjørende containeren). Én tenant om
// gangen; STOPPER ved første feil så en dårlig image bare rammer én kunde.
// Entrypoint kjører selv `prisma migrate deploy` + bootstrap ved (re)start.
//
//   docker exec <control-plane> npx tsx src/rollout.ts               # dry-run: alle aktive
//   docker exec <control-plane> npx tsx src/rollout.ts --yes         # utfør: alle aktive
//   docker exec <control-plane> npx tsx src/rollout.ts <subdomain>       # dry-run: én
//   docker exec <control-plane> npx tsx src/rollout.ts <subdomain> --yes # utfør: én

const docker = new Docker();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Leser eksisterende DATABASE_URL fra den kjørende containeren (så vi ikke roterer passord). */
async function existingDbUrl(subdomain: string): Promise<string | null> {
  try {
    const info = await docker.getContainer(containerNameFor(subdomain)).inspect();
    const line = (info.Config.Env ?? []).find((e) => e.startsWith("DATABASE_URL="));
    return line ? line.slice("DATABASE_URL=".length) : null;
  } catch {
    return null; // ingen container
  }
}

/** Venter til containeren er oppe og stabil (ikke restart-loop) etter recreate. */
async function waitHealthy(subdomain: string, timeoutMs = 90_000): Promise<boolean> {
  const c = docker.getContainer(containerNameFor(subdomain));
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const info = await c.inspect();
      if (info.State.Running && !info.State.Restarting) {
        // Bekreft stabilitet: fortsatt oppe uten ny restart etter en liten pause.
        const startCount = info.RestartCount;
        await sleep(8000);
        const info2 = await c.inspect();
        if (info2.State.Running && !info2.State.Restarting && info2.RestartCount === startCount) {
          return true;
        }
      }
    } catch {
      /* midlertidig – prøv igjen */
    }
    await sleep(3000);
  }
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--yes");
  const only = args.find((a) => a !== "--yes") ?? null;

  // Hvilke tenants: én navngitt, ellers alle aktive.
  let tenants: Tenant[];
  if (only) {
    const t = await findBySubdomain(only);
    if (!t) {
      console.error(`Ukjent tenant: ${only}`);
      await registryPool.end();
      process.exit(1);
    }
    tenants = [t];
  } else {
    tenants = await findByStatuses(["active"]);
  }

  console.log(`Ruller ${tenants.length} tenant(er) til gjeldende TENANT_IMAGE:`);
  for (const t of tenants) console.log(`  • ${t.subdomain} (status ${t.status})`);

  if (!apply) {
    console.log("\n(dry-run – ingenting ble endret. Kjør med --yes for å utføre.)");
    await registryPool.end();
    return;
  }

  const done: string[] = [];
  const skipped: string[] = [];
  for (const t of tenants) {
    const dbUrl = await existingDbUrl(t.subdomain);
    if (!dbUrl) {
      console.warn(
        `⚠ ${t.subdomain}: ingen kjørende container/DATABASE_URL – hoppes over. ` +
          `Re-provisjoner denne manuelt (flip status→provisioning) hvis den skal opp.`,
      );
      skipped.push(t.subdomain);
      continue;
    }
    console.log(`↻ Ruller ${t.subdomain} …`);
    await ensureContainer(t.subdomain, t.adminEmail, dbUrl); // recreate fra ny image
    const ok = await waitHealthy(t.subdomain);
    if (!ok) {
      console.error(
        `❌ ${t.subdomain} ble ikke frisk etter oppgradering. STOPPER rulleringen.\n` +
          `   Ferdig: [${done.join(", ") || "ingen"}]. Gjenstår (urørt): ` +
          `[${tenants.slice(tenants.indexOf(t) + 1).map((x) => x.subdomain).join(", ") || "ingen"}].\n` +
          `   Sjekk 'docker logs ${containerNameFor(t.subdomain)}' og vurder rollback (bygg forrige commit).`,
      );
      await registryPool.end();
      process.exit(1);
    }
    console.log(`✔ ${t.subdomain} oppgradert og frisk.`);
    done.push(t.subdomain);
  }

  console.log(
    `\n✅ Rullering ferdig. Oppgradert: ${done.length} [${done.join(", ") || "ingen"}]` +
      (skipped.length ? ` · hoppet over: ${skipped.length} [${skipped.join(", ")}]` : ""),
  );
  await registryPool.end();
}

main().catch(async (e) => {
  console.error("Rollering feilet:", e);
  await registryPool.end().catch(() => {});
  process.exit(1);
});
