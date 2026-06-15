import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Norsk er standard og beholder dagens URL-er (ingen prefiks).
  // Engelsk legges på under /en.
  locales: ["no", "en"],
  defaultLocale: "no",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
