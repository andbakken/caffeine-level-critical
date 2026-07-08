/**
 * Appens visningsnavn — ÉN kilde. Endre KUN her ved navnebytte.
 *
 * - `APP_NAME` er hovednavnet vi refererer til i det daglige og bruker der
 *   plassen er trang (nav, dashboard, løpende tekst).
 * - `APP_NAME_FULL` er det fulle navnet med undertittel. Brukes der merkevaren
 *   skal stå tydelig frem på nettsiden (sidetitler, delingsbilde, footer, hero).
 *
 * I kode importeres konstantene direkte. I messages/*.json brukes tokenene
 * `%BRAND%` (→ APP_NAME) og `%BRAND_FULL%` (→ APP_NAME_FULL), som byttes ut når
 * meldingene lastes (se src/i18n/request.ts). Da resolver alle t()-kall
 * automatisk, uten å sende navnet inn ved hvert kall.
 */
export const APP_NAME = "Caffeine Level Critical";

/** Undertittelen. Vises sammen med APP_NAME der merkevaren skal stå tydelig frem. */
export const APP_SUBTITLE = "A Cubicle Odyssey";

/** Fullt navn med undertittel — for sidetitler, delingsbilde, footer m.m. */
export const APP_NAME_FULL = `${APP_NAME}: ${APP_SUBTITLE}`;

/**
 * Kontakt-e-post for hosting-henvendelser. Midlertidig privat adresse frem til
 * selvbetjent kjøp (Stripe) er live — da byttes «ta kontakt»-flyten tilbake til
 * checkout. Endre KUN her ved bytte til en dedikert support-adresse.
 */
export const CONTACT_EMAIL = "and.bakken@gmail.com";

/** Plassholdere som brukes i messages/*.json i stedet for det faktiske navnet. */
export const BRAND_TOKEN = "%BRAND%";
export const BRAND_FULL_TOKEN = "%BRAND_FULL%";

/** Bytter alle %BRAND_FULL%- og %BRAND%-token i en (nestet) meldingsstruktur. */
export function applyBrand<T>(value: T): T {
  if (typeof value === "string") {
    // %BRAND_FULL% først: %BRAND% er en delstreng av den og ville ellers matche først.
    return value
      .split(BRAND_FULL_TOKEN)
      .join(APP_NAME_FULL)
      .split(BRAND_TOKEN)
      .join(APP_NAME) as T;
  }
  if (Array.isArray(value)) {
    return value.map(applyBrand) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) out[key] = applyBrand(val);
    return out as T;
  }
  return value;
}
