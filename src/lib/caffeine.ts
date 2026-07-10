// Koffeinkalkulatoren (markedsside-lenkemagnet): felles regnestykke for
// klientsiden, delingsmetadata og OG-bildet, så tallene aldri spriker.

/** Omtrentlig koffein per kopp (mg). Kilder: EFSA/USDA-typetall, avrundet. */
export const CAFFEINE_MG = { coffee: 90, tea: 40, cocoa: 5 } as const;

/** EFSA regner 400 mg/dag som trygt for voksne — over det er nivået «kritisk». */
export const LEVELS = [
  { key: "low", max: 100 },
  { key: "moderate", max: 250 },
  { key: "high", max: 400 },
  { key: "critical", max: Infinity },
] as const;

export type LevelKey = (typeof LEVELS)[number]["key"];

export type CalcInput = { people: number; coffee: number; tea: number; cocoa: number };

export function clampInput(raw: Partial<Record<keyof CalcInput, unknown>>): CalcInput {
  const clamp = (v: unknown, max: number) => {
    const n = Math.floor(Number(v));
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
  };
  return {
    people: Math.max(clamp(raw.people, 5000), 1),
    coffee: clamp(raw.coffee, 50),
    tea: clamp(raw.tea, 50),
    cocoa: clamp(raw.cocoa, 50),
  };
}

export function calculate(input: CalcInput) {
  const perPerson =
    input.coffee * CAFFEINE_MG.coffee +
    input.tea * CAFFEINE_MG.tea +
    input.cocoa * CAFFEINE_MG.cocoa;
  const total = perPerson * input.people;
  const level = LEVELS.find((l) => perPerson < l.max)!.key;
  return {
    perPerson,
    total,
    level,
    /** Red Bull ≈ 80 mg pr boks — morsom ekvivalent til delingskortet. */
    redBulls: Math.round(total / 80),
    espresso: Math.round(total / 63),
  };
}
