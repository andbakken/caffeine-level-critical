import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// I denne Next-versjonen er «middleware» omdøpt til «proxy» (deprecation).
// Ved bruk av src/-mappe må fila ligge i src/, på samme nivå som app/.
// next-intl sin middleware er bare en (request) => response-funksjon.
export default createMiddleware(routing);

export const config = {
  // Kjør på alle ruter unntatt API, Next-interne og filer med punktum (statiske assets).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
