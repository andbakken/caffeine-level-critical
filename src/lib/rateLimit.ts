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

// Feil-telleren for innlogging lå tidligere her, i minne. Den bor nå i DB —
// se src/lib/loginThrottle.ts. Grunnen: containere re-skapes ved hver utrulling,
// og en teller i minne nullstiller låsen hver gang vi deployer.

/** Henter klient-IP fra standard proxy-headere (Traefik setter X-Forwarded-For). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
