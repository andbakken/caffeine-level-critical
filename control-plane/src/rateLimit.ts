// Enkel in-memory rate-limiter for control-plane. Én prosess, lavt volum → holder.
// Speiler mønsteret i appen (src/lib/rateLimit.ts).

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** true = innenfor grensen (slipp gjennom), false = blokkér. */
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

/** Klient-IP fra Traefik-satte proxy-headere. */
export function clientIp(req: { headers: Record<string, unknown> }): string {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) return xff.split(",")[0].trim();
  const real = req.headers["x-real-ip"];
  return typeof real === "string" && real.length ? real : "unknown";
}
