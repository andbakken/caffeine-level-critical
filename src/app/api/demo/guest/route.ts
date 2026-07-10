import { NextResponse } from "next/server";
import { getCurrentUser, createSession } from "@/lib/auth";
import { DEMO_MODE, createGuestUser } from "@/lib/demo";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { requestOrigin } from "@/lib/http";

// Gjeste-innlogging på demo-instansen: oppretter en anonym Gjest-xxxx-bruker
// med sesjon og sender videre til ?next=. Finnes kun i demo-modus — på alle
// andre instanser svarer ruten 404.

/** Kun interne stier (é/t/leaderboard …) — aldri eksterne redirects. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export async function GET(req: Request) {
  if (!DEMO_MODE) {
    return NextResponse.json({ ok: false, error: "Ikke tilgjengelig" }, { status: 404 });
  }

  const next = safeNext(new URL(req.url).searchParams.get("next"));
  const origin = requestOrigin(req);

  // Har besøkeren allerede en sesjon (gjest eller ei), er alt klart.
  const existing = await getCurrentUser();
  if (existing) return NextResponse.redirect(`${origin}${next}`);

  // Vern mot bruker-flom: få nye gjester per IP per time holder lenge for
  // ekte besøk (én gjest gjenbrukes via sesjonscookien i 180 dager).
  if (!rateLimit(`demo-guest:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const guest = await createGuestUser();
  await createSession(guest.id);
  return NextResponse.redirect(`${origin}${next}`);
}
