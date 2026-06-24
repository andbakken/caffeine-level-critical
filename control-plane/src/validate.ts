// Subdomene-validering. Streng: kun små bokstaver/tall/bindestrek, 3–30 tegn,
// ikke start/slutt på bindestrek. Reserverte navn blokkeres.

const RESERVED = new Set([
  "www", "admin", "api", "app", "mail", "smtp", "ftp", "ns", "ns1", "ns2",
  "status", "blog", "docs", "help", "support", "billing", "dashboard",
  "static", "cdn", "assets", "traefik", "postgres", "db",
]);

const PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;

export function normalizeSubdomain(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateSubdomain(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const value = normalizeSubdomain(raw);
  if (!PATTERN.test(value)) {
    return { ok: false, error: "Subdomenet må være 3–30 tegn: a–z, 0–9 og bindestrek." };
  }
  if (RESERVED.has(value)) {
    return { ok: false, error: "Dette subdomenet er reservert." };
  }
  return { ok: true, value };
}

// Postgres-identifikatorer er trygge når de stammer fra et validert subdomene.
// Vi prefikser for å unngå kollisjon med systemnavn.
export function dbNameFor(subdomain: string): string {
  return `tenant_${subdomain.replace(/-/g, "_")}`;
}

export function dbRoleFor(subdomain: string): string {
  return `role_${subdomain.replace(/-/g, "_")}`;
}

export function containerNameFor(subdomain: string): string {
  return `tenant-${subdomain}`;
}
