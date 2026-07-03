import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

// I denne Next-versjonen er «middleware» omdøpt til «proxy» (deprecation).
// Ved bruk av src/-mappe må fila ligge i src/, på samme nivå som app/.
// next-intl sin middleware er bare en (request) => response-funksjon.
const intlProxy = createMiddleware(routing);

// Tenant-instanser (IS_TENANT=1, satt av control-plane ved provisjonering) kjører
// nøyaktig samme image som marketing-apex – inkludert markedssidene. På en tenant er
// salgssidene (landing, priser, onboarding, last-ned) irrelevante og forvirrende:
// kunden HAR allerede en instans. Vi sender dem rett til innlogging i stedet, og merker
// alt som noindex (unngår duplicate content på *.<domene>). Apex har ikke flagget.
const IS_TENANT = process.env.IS_TENANT === "1";

// Rene salgs-ruter (uten locale-prefiks) som ikke gir mening på en kunde-instans.
// /login, /register og de juridiske sidene beholdes – de trengs på en tenant.
const MARKETING_ONLY = new Set(["", "produkt", "last-ned", "kom-i-gang", "velkommen"]);

function tenantRedirect(request: NextRequest): NextResponse | null {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const locale = segments[0] === "en" ? "en" : "";
  const logical = (locale ? segments.slice(1) : segments).join("/");
  if (!MARKETING_ONLY.has(logical)) return null;

  const url = request.nextUrl.clone();
  url.pathname = locale ? "/en/login" : "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export default function proxy(request: NextRequest) {
  if (IS_TENANT) {
    const redirect = tenantRedirect(request);
    if (redirect) return redirect;
  }
  const response = intlProxy(request);
  if (IS_TENANT) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  // Kjør på alle ruter unntatt API, Next-interne og filer med punktum (statiske assets).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
