import { NextResponse } from "next/server";

/**
 * Absolutt origin for den innkommende requesten, utledet i RUNTIME (bak Traefik).
 * Brukes til å bygge lenker som må peke på riktig tenant (f.eks. magic-link).
 *
 * ⚠️ Bruk IKKE NEXT_PUBLIC_SITE_URL til dette: den er build-time og bakes til apex-
 * domenet for ALLE tenants, så magic-lenker ville pekt på apex i stedet for kundens
 * eget subdomene. Traefik ruter kun gyldige Host-er inn til containeren, så Host-headeren
 * er trygg å stole på her. Se [[nfc-tag-base-url-build-time-gotcha]].
 */
export function requestOrigin(req: Request): string {
  const proto =
    req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");
  const host = req.headers.get("host") ?? req.headers.get("x-forwarded-host");
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function ok<T extends object>(data: T = {} as T) {
  return json({ ok: true, ...data });
}

export function fail(message: string, status = 400) {
  return json({ ok: false, error: message }, status);
}
