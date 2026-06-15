export type Period = "today" | "week" | "month" | "all";

export function periodStart(period: Period, now = new Date()): Date | null {
  switch (period) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "week": {
      const d = new Date(now);
      const day = (d.getDay() + 6) % 7; // Monday = 0
      d.setDate(d.getDate() - day);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "month": {
      const d = new Date(now);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "all":
    default:
      return null;
  }
}

export function parsePeriod(value: string | null | undefined): Period {
  if (value === "today" || value === "week" || value === "month" || value === "all") {
    return value;
  }
  return "today";
}
