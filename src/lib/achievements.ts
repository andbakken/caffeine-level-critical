// Regeltyper for merker. Delt mellom API-validering og utdelingslogikk.
export const RULE_TYPES = ["total", "distinct", "drink", "before_hour", "after_hour"] as const;
export type RuleType = (typeof RULE_TYPES)[number];
