import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

// I denne Next-versjonen er «middleware» omdøpt til «proxy» (deprecation).
// Ved bruk av src/-mappe må fila ligge i src/, på samme nivå som app/.
// next-intl sin middleware er bare en (request) => response-funksjon.
const intlProxy = createMiddleware(routing);

// Tenant-instanser (IS_TENANT=1, satt av control-plane ved provisjonering) kjører
// nøyaktig samme image som marketing-apex – inkludert markedssidene. For å unngå
// duplicate content på *.<domene> merker vi alt på tenants som noindex. Apex/marketing
// har ikke flagget og indekseres normalt (styrt av robots.ts + sitemap.ts).
const IS_TENANT = process.env.IS_TENANT === "1";

export default function proxy(request: NextRequest) {
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
