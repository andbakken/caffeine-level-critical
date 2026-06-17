/**
 * Appens visningsnavn — ÉN kilde. Endre KUN her ved navnebytte.
 *
 * - I kode brukes `APP_NAME` direkte (nav, dashboard, metadata, OG-bilde …).
 * - I messages/*.json brukes tokenet `%BRAND%`, som byttes ut med APP_NAME
 *   når meldingene lastes (se src/i18n/request.ts). Da resolver alle t()-kall
 *   automatisk, uten å sende navnet inn ved hvert kall.
 */
export const APP_NAME = "Quest of the Roasted Bean";

/** Plassholder som brukes i messages/*.json i stedet for det faktiske navnet. */
export const BRAND_TOKEN = "%BRAND%";

/** Bytter alle %BRAND%-token i en (nestet) meldingsstruktur med APP_NAME. */
export function applyBrand<T>(value: T): T {
  if (typeof value === "string") {
    return value.split(BRAND_TOKEN).join(APP_NAME) as T;
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
