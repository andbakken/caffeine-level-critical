import { randomBytes } from "node:crypto";
import pg from "pg";
import Docker from "dockerode";
import { env } from "./env.js";
import { dbNameFor, dbRoleFor, containerNameFor } from "./validate.js";
import { setStatus, type Tenant } from "./registry.js";
import { sendWelcome, sendEmail } from "./email.js";

const docker = new Docker(); // bruker /var/run/docker.sock

// Oppretter (idempotent) database + rolle for en tenant i den delte Postgres-instansen.
// Identifikatorer kommer fra et VALIDERT subdomene (kun [a-z0-9_]) → trygge å interpolere.
async function ensureDatabase(subdomain: string): Promise<{ dbName: string; dbUrl: string }> {
  const dbName = dbNameFor(subdomain);
  const role = dbRoleFor(subdomain);
  const password = randomBytes(24).toString("hex"); // url-trygt, ingen escaping nødvendig

  const admin = new pg.Client({
    host: env.pg.host,
    user: env.pg.superUser,
    password: env.pg.superPassword,
    database: "postgres", // vedlikeholds-DB
  });
  await admin.connect();
  try {
    const roleExists = await admin.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [role]);
    if (roleExists.rowCount === 0) {
      await admin.query(`CREATE ROLE "${role}" LOGIN PASSWORD '${password}'`);
    } else {
      await admin.query(`ALTER ROLE "${role}" WITH PASSWORD '${password}'`);
    }

    const dbExists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (dbExists.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${dbName}" OWNER "${role}"`);
    }

    // Herding: kun tenantens egen rolle kan koble til databasen. Idempotent, så den
    // kjøres også for gamle tenants ved re-provisjonering. Eierskapet hindrer lesing
    // uansett – dette fjerner unødvendig angrepsflate (PUBLIC har CONNECT som default).
    await admin.query(`REVOKE CONNECT ON DATABASE "${dbName}" FROM PUBLIC`);
    await admin.query(`GRANT CONNECT ON DATABASE "${dbName}" TO "${role}"`);
  } finally {
    await admin.end();
  }

  const dbUrl = `postgresql://${role}:${password}@${env.pg.host}:5432/${dbName}`;
  return { dbName, dbUrl };
}

// (Re)starter tenant-containeren med riktig env + Traefik-labels. Idempotent:
// fjerner en eksisterende container med samme navn først, så env alltid er fersk.
async function ensureContainer(subdomain: string, adminEmail: string, dbUrl: string): Promise<void> {
  const name = containerNameFor(subdomain);
  const host = `${subdomain}.${env.baseDomain}`;
  const siteUrl = `https://${host}`;

  // Fjern eventuell eksisterende container (idempotens).
  try {
    const existing = docker.getContainer(name);
    await existing.remove({ force: true });
  } catch {
    /* fantes ikke – greit */
  }

  const container = await docker.createContainer({
    name,
    Image: env.tenantImage,
    Env: [
      `DATABASE_URL=${dbUrl}`,
      `ADMIN_EMAIL=${adminEmail}`,
      "UPLOAD_DIR=/app/uploads",
      `NEXT_PUBLIC_SITE_URL=${siteUrl}`,
      `NEXT_PUBLIC_TAG_BASE_URL=${siteUrl}`,
      `RESEND_API_KEY=${env.resendApiKey}`,
      `MAIL_FROM=${env.mailFrom}`,
      "IS_TENANT=1", // markedssidene på tenant-subdomener merkes noindex (se src/proxy.ts)
      "REQUIRE_INVITE=1", // ny bruker-registrering krever invitasjonskode (se register-API)
      "NODE_ENV=production",
    ],
    Labels: {
      "traefik.enable": "true",
      [`traefik.http.routers.${name}.rule`]: `Host(\`${host}\`)`,
      [`traefik.http.routers.${name}.entrypoints`]: "websecure",
      [`traefik.http.routers.${name}.tls.certresolver`]: "le",
      [`traefik.http.services.${name}.loadbalancer.server.port`]: "3000",
      "traefik.docker.network": env.edgeNetwork,
    },
    HostConfig: {
      RestartPolicy: { Name: "unless-stopped" },
      Binds: [`${name}-uploads:/app/uploads`],
      // Ressurstak: én løpsk tenant skal ikke kunne ta ned hele serveren (alle kunder).
      // Tak, ikke reservasjon – oversubscription er greit ved normal idle-last.
      Memory: env.tenantMemoryMb * 1024 * 1024,
      MemoryReservation: Math.floor((env.tenantMemoryMb * 1024 * 1024) / 3),
      NanoCpus: Math.round(env.tenantCpus * 1_000_000_000),
    },
    NetworkingConfig: {
      EndpointsConfig: { [env.dataNetwork]: {} },
    },
  });

  // Koble på edge-nettet (Traefik) i tillegg til data-nettet, så start.
  await docker.getNetwork(env.edgeNetwork).connect({ Container: container.id });
  await container.start();
}

/** Full provisjonering, idempotent. Trygg å kjøre flere ganger for samme subdomene.
 *  Ved feil settes status «failed» og eieren varsles – kunden har betalt, så en stille
 *  feil er ikke akseptabel. Retry-løkka i index.ts plukker opp «failed»/«provisioning». */
export async function provisionTenant(t: Tenant): Promise<void> {
  try {
    await setStatus(t.subdomain, "provisioning");
    const { dbUrl } = await ensureDatabase(t.subdomain);
    await ensureContainer(t.subdomain, t.adminEmail, dbUrl);
    await setStatus(t.subdomain, "active");

    const siteUrl = `https://${t.subdomain}.${env.baseDomain}`;
    await sendWelcome(t.adminEmail, t.orgName, siteUrl);
    console.log(`✅ Provisjonerte ${t.subdomain} (${t.adminEmail})`);
  } catch (err) {
    await setStatus(t.subdomain, "failed").catch(() => {});
    console.error(`❌ Provisjonering feilet (${t.subdomain}):`, err);
    await notifyOwner(
      `Provisjonering feilet: ${t.subdomain}`,
      `Provisjonering av <strong>${t.subdomain}</strong> (${t.adminEmail}) feilet.<br>` +
        `Feil: <pre>${String(err instanceof Error ? err.message : err)}</pre>` +
        `Retry kjører automatisk hver time, men sjekk gjerne loggen.`,
    ).catch(() => {});
    throw err; // la kalleren logge også
  }
}

/** Sender et driftsvarsel til eieren. Stille no-op hvis OWNER_EMAIL/RESEND ikke er satt. */
export async function notifyOwner(subject: string, html: string): Promise<void> {
  if (!env.ownerEmail) {
    console.warn(`[varsel – ingen OWNER_EMAIL] ${subject}`);
    return;
  }
  await sendEmail(env.ownerEmail, subject, `<div style="font-family:system-ui,sans-serif">${html}</div>`);
}

/** Stopper en tenant (ved oppsigelse/manglende betaling). Beholder data inntil videre. */
export async function pauseTenant(subdomain: string): Promise<void> {
  await setStatus(subdomain, "paused");
  try {
    await docker.getContainer(containerNameFor(subdomain)).stop();
  } catch {
    /* allerede stoppet */
  }
  console.log(`⏸ Pauset ${subdomain}`);
}
