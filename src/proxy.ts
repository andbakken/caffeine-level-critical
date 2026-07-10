import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

// I denne Next-versjonen er «middleware» omdøpt til «proxy» (deprecation).
// Ved bruk av src/-mappe må fila ligge i src/, på samme nivå som app/.
// next-intl sin middleware er bare en (request) => response-funksjon.
const intlProxy = createMiddleware(routing);

// Tre varianter av samme image:
//  - Apex/marketing: ingen flagg – full salgs-side.
//  - Hostet tenant (IS_TENANT=1, satt av control-plane): salgssidene er irrelevante
//    (kunden HAR allerede en instans), men de juridiske sidene beholdes – kunden
//    trenger dem for den hostede tjenesten.
//  - Selvhost (SELF_HOST=1): skjuler BÅDE salgssidene OG de juridiske sidene
//    (Vilkår/Personvern/DPA gjelder kun vår hostede tjeneste, ikke selvhost).
// I begge de skjulte modusene sender vi salgs-treff rett til innlogging og merker
// alt som noindex (unngår duplicate content på *.<domene>).
const IS_TENANT = process.env.IS_TENANT === "1";
const SELF_HOST = process.env.SELF_HOST === "1";
const HIDE_SALES = IS_TENANT || SELF_HOST;

// Rene salgs-ruter (uten locale-prefiks) som ikke gir mening på tenant/selvhost.
// /login og /register beholdes alltid – de trengs overalt.
const MARKETING_ONLY = new Set(["", "produkt", "priser", "merker", "last-ned", "kom-i-gang", "velkommen"]);
// Juridiske sider: beholdes på tenant, men skjules på selvhost (se over).
const LEGAL_ONLY = new Set(["vilkar", "personvern", "databehandleravtale"]);

function salesRedirect(request: NextRequest): NextResponse | null {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const locale = segments[0] === "en" ? "en" : "";
  const logical = (locale ? segments.slice(1) : segments).join("/");
  const hidden = MARKETING_ONLY.has(logical) || (SELF_HOST && LEGAL_ONLY.has(logical));
  if (!hidden) return null;

  const url = request.nextUrl.clone();
  url.pathname = locale ? "/en/login" : "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export default function proxy(request: NextRequest) {
  if (HIDE_SALES) {
    const redirect = salesRedirect(request);
    if (redirect) return redirect;
  }
  const response = intlProxy(request);
  if (HIDE_SALES) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  // Kjør på alle ruter unntatt API, Next-interne og filer med punktum (statiske assets).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
