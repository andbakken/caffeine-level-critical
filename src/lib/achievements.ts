// Regeltyper for merker. Delt mellom API-validering og utdelingslogikk.
export const RULE_TYPES = [
  "total",
  "distinct",
  "drink",
  "before_hour",
  "after_hour",
  "drink_each",
  "streak",
  "day_total",
  "weekend",
  // Nye regeltyper (kumulative der ikke annet er nevnt):
  "distinct_station", // besøkt N ulike stasjoner
  "distinct_tag", // skannet N ulike brikker
  "tag_total", // logget N kopper via brikke (source=tag)
  "longest_streak", // beste streak noensinne (ikke bare nåværende)
  "active_days", // logget på N ulike dager totalt
  "hour_slots", // logget i N ulike klokketimer
  "at_hour", // en kopp i en bestemt time (moment; threshold = time 0–23)
] as const;
export type RuleType = (typeof RULE_TYPES)[number];

// Regeltyper som ikke bruker terskelverdien (threshold ignoreres i evaluering og UI).
export const THRESHOLDLESS_RULES: readonly RuleType[] = ["weekend"];
