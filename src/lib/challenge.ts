// «Utfordre kontoret»-delekort: felles rensing av navn for siden og OG-bildet.
// Navnene kommer rett fra URL-en (hvem som helst kan lage lenker), så de kuttes
// hardt: maks 24 tegn, kun bokstaver/tall/vanlige tegn.

export function cleanName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[^\p{L}\p{N} .,&!?'-]/gu, "")
    .trim()
    .slice(0, 24);
}
