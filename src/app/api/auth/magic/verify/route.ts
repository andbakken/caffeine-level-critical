import { NextResponse } from "next/server";
import { consumeLoginToken } from "@/lib/magicLink";
import { createSession } from "@/lib/auth";
import { requestOrigin } from "@/lib/http";

// Løser inn magic-link-token fra e-postlenken og oppretter en sesjon.
// GET fordi den åpnes direkte fra e-post. Redirecter til appen ved suksess.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  // Runtime-origin (riktig tenant-domene) – IKKE NEXT_PUBLIC_SITE_URL (build-time apex).
  const base = requestOrigin(req);

  if (!token) {
    return NextResponse.redirect(`${base}/login?error=invalid`);
  }

  const userId = await consumeLoginToken(token);
  if (!userId) {
    return NextResponse.redirect(`${base}/login?error=expired`);
  }

  await createSession(userId);
  return NextResponse.redirect(`${base}/dashboard`);
}
