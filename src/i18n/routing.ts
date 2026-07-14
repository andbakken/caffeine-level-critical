import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Norsk er standard og beholder dagens URL-er (ingen prefiks).
  // Engelsk legges på under /en.
  locales: ["no", "en"],
  defaultLocale: "no",
  localePrefix: "as-needed",
  // Vi gjør vår EGEN språkdeteksjon i proxy.ts: norsk kun for norsktalende
  // nettlesere, alt annet → engelsk. next-intl sin innebygde deteksjon ville
  // falt tilbake på defaultLocale (norsk) for ukjente språk, så den er av her.
  // localeCookie står fortsatt på (default), så et aktivt språkvalg huskes.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
