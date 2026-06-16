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
] as const;
export type RuleType = (typeof RULE_TYPES)[number];

// Regeltyper som ikke bruker terskelverdien (threshold ignoreres i evaluering og UI).
export const THRESHOLDLESS_RULES: readonly RuleType[] = ["weekend"];
