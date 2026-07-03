// Enkel in-memory rate-limiter. Holder per prosess – helt nok i modell A der hver
// kunde har sin egen container. Brukes på magic-link-forespørsler o.l.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Returnerer true hvis forespørselen er innenfor grensen, false hvis den skal blokkeres.
 * @param key   unik nøkkel (f.eks. `magic:<ip>` eller `magic:<email>`)
 * @param limit antall tillatte treff per vindu
 * @param windowMs vinduslengde i millisekunder
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

// ── Feil-teller for innlogging ────────────────────────────────────────────────
// Egen tracker der KUN mislykkede forsøk teller, og en vellykket innlogging
// nullstiller. Slik bremses målrettet PIN-gjetting mot én konto uten at en ekte
// bruker som taster feil et par ganger og så riktig, blir låst ute.
const failures = new Map<string, Bucket>();

/** true hvis kontoen har for mange nylige feilforsøk (skal blokkeres). Teller ikke opp. */
export function tooManyFailures(key: string, limit: number, windowMs: number): boolean {
  const b = failures.get(key);
  if (!b || b.resetAt < Date.now()) return false;
  return b.count >= limit;
}

/** Registrer ett feilforsøk for nøkkelen. */
export function recordFailure(key: string, windowMs: number): void {
  const now = Date.now();
  const b = failures.get(key);
  if (!b || b.resetAt < now) failures.set(key, { count: 1, resetAt: now + windowMs });
  else b.count++;
}

/** Nullstill feilforsøk (kalles ved vellykket innlogging). */
export function clearFailures(key: string): void {
  failures.delete(key);
}

/** Henter klient-IP fra standard proxy-headere (Traefik setter X-Forwarded-For). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
