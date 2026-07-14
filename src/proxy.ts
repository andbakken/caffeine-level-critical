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
const MARKETING_ONLY = new Set([
  "",
  "produkt",
  "priser",
  "merker",
  "koffein-kalkulator",
  "utfordring",
  "last-ned",
  "kom-i-gang",
  "velkommen",
]);
// Juridiske sider: beholdes på tenant, men skjules på selvhost (se over).
const LEGAL_ONLY = new Set(["vilkar", "personvern", "databehandleravtale"]);

// Egen språkdeteksjon: norsk KUN når nettleseren faktisk foretrekker norsk –
// alle andre språk (og ukjent/tomt) får engelsk. Et aktivt valg (NEXT_LOCALE-
// cookie, satt av next-intl når brukeren klikker NO/EN) vinner alltid.
function preferredLocale(request: NextRequest): "no" | "en" {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie === "no" || cookie === "en") return cookie;

  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const weight = q ? parseFloat(q.split("=")[1]) : 1;
      return { primary: tag.trim().toLowerCase().split("-")[0], weight: isNaN(weight) ? 0 : weight };
    })
    .filter((x) => x.primary)
    .sort((a, b) => b.weight - a.weight);

  // Velg det høyest rangerte språket vi kjenner; norsk (no/nb/nn) → norsk,
  // engelsk → engelsk. Er ingen av dem nevnt, faller vi tilbake på engelsk.
  for (const { primary } of ranked) {
    if (primary === "no" || primary === "nb" || primary === "nn") return "no";
    if (primary === "en") return "en";
  }
  return "en";
}

// Redirigerer uprefiksede (norsk-URL) treff til /en når nettleseren ikke
// foretrekker norsk. /en-URLer og norsktalende slipper gjennom uendret.
function localeRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const hasEnPrefix = pathname === "/en" || pathname.startsWith("/en/");
  if (hasEnPrefix) return null;
  if (preferredLocale(request) === "no") return null;

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
  return NextResponse.redirect(url);
}

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
  // Språkvalg før next-intl: alt annet enn norsk → engelsk (/en).
  const locale = localeRedirect(request);
  if (locale) return locale;

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
