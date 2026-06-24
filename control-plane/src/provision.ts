import { randomBytes } from "node:crypto";
import pg from "pg";
import Docker from "dockerode";
import { env } from "./env.js";
import { dbNameFor, dbRoleFor, containerNameFor } from "./validate.js";
import { setStatus, type Tenant } from "./registry.js";
import { sendWelcome } from "./email.js";

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
    },
    NetworkingConfig: {
      EndpointsConfig: { [env.dataNetwork]: {} },
    },
  });

  // Koble på edge-nettet (Traefik) i tillegg til data-nettet, så start.
  await docker.getNetwork(env.edgeNetwork).connect({ Container: container.id });
  await container.start();
}

/** Full provisjonering, idempotent. Trygg å kjøre flere ganger for samme subdomene. */
export async function provisionTenant(t: Tenant): Promise<void> {
  await setStatus(t.subdomain, "provisioning");
  const { dbUrl } = await ensureDatabase(t.subdomain);
  await ensureContainer(t.subdomain, t.adminEmail, dbUrl);
  await setStatus(t.subdomain, "active");

  const siteUrl = `https://${t.subdomain}.${env.baseDomain}`;
  await sendWelcome(t.adminEmail, t.orgName, siteUrl);
  console.log(`✅ Provisjonerte ${t.subdomain} (${t.adminEmail})`);
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
