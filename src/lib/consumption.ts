import { prisma } from "@/lib/db";

const COOLDOWN_MS = 20_000; // hindrer dobbel-tapp / spam

export type AwardedBadge = { key: string; name: string; icon: string };

export type LogResult =
  | { created: false; cooldown: true }
  | { created: true; consumptionId: number; newBadges: AwardedBadge[] };

export async function logConsumption(opts: {
  userId: number;
  drinkId: number;
  source: "web" | "tag";
  stationId?: number | null;
  tagId?: number | null;
}): Promise<LogResult> {
  const recent = await prisma.consumption.findFirst({
    where: {
      userId: opts.userId,
      drinkId: opts.drinkId,
      createdAt: { gt: new Date(Date.now() - COOLDOWN_MS) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent) return { created: false, cooldown: true };

  const c = await prisma.consumption.create({
    data: {
      userId: opts.userId,
      drinkId: opts.drinkId,
      source: opts.source,
      stationId: opts.stationId ?? null,
      tagId: opts.tagId ?? null,
    },
  });

  const newBadges = await evaluateAchievements(opts.userId, c.createdAt);
  return { created: true, consumptionId: c.id, newBadges };
}

/** Starten (00:00 lokal tid) av dagen som `d` faller på. */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Lokal dato som `YYYY-MM-DD`, brukt som nøkkel for å telle distinkte dager. */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Antall sammenhengende dager t.o.m. `at` der brukeren har logget minst én drikke.
 * `at` selv teller alltid som dag 1 (loggingen som nettopp skjedde).
 */
function computeStreak(dates: Date[], at: Date): number {
  const days = new Set(dates.map(dayKey));
  let streak = 0;
  const cursor = startOfDay(at);
  // tell bakover så lenge dagen finnes i historikken
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Lengste sammenhengende rekke av dager (noensinne) der brukeren logget minst én drikke.
 * Skiller seg fra `computeStreak` som kun ser på den pågående rekka fram til nå.
 */
function computeLongestStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  // unike dager, sortert stigende (én dag = 24t, så millisekund-sortering holder)
  const uniqueDays = [...new Set(dates.map(dayKey))]
    .map((k) => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m, d).getTime();
    })
    .sort((a, b) => a - b);

  const DAY_MS = 24 * 60 * 60 * 1000;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    // sammenlign faktiske kalenderdager, robust mot sommertid
    const prev = startOfDay(new Date(uniqueDays[i - 1]));
    const next = startOfDay(new Date(uniqueDays[i]));
    const diffDays = Math.round((next.getTime() - prev.getTime()) / DAY_MS);
    if (diffDays === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }
  return longest;
}

async function evaluateAchievements(userId: number, at: Date): Promise<AwardedBadge[]> {
  const [
    total,
    grouped,
    already,
    achievements,
    allDrinks,
    dayTotal,
    dayRows,
    stationGroups,
    tagGroups,
    tagTotal,
  ] = await Promise.all([
    prisma.consumption.count({ where: { userId } }),
    prisma.consumption.groupBy({ by: ["drinkId"], where: { userId }, _count: { _all: true } }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
    prisma.achievement.findMany({ where: { isActive: true } }),
    prisma.drink.findMany({ select: { id: true } }),
    prisma.consumption.count({ where: { userId, createdAt: { gte: startOfDay(at) } } }),
    prisma.consumption.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.consumption.groupBy({
      by: ["stationId"],
      where: { userId, stationId: { not: null } },
    }),
    prisma.consumption.groupBy({ by: ["tagId"], where: { userId, tagId: { not: null } } }),
    prisma.consumption.count({ where: { userId, source: "tag" } }),
  ]);

  const distinctDrinks = grouped.length;
  const countByDrink = new Map(grouped.map((g) => [g.drinkId, g._count._all]));
  const hour = at.getHours();
  const have = new Set(already.map((a) => a.achievementId));
  const allDrinkIds = allDrinks.map((d) => d.id);
  const allDates = dayRows.map((r) => r.createdAt);
  const streakDays = computeStreak(allDates, at);
  const dayOfWeek = at.getDay();
  const distinctStations = stationGroups.length;
  const distinctTags = tagGroups.length;
  const longestStreak = computeLongestStreak(allDates);
  const activeDays = new Set(allDates.map(dayKey)).size;
  const distinctHours = new Set(allDates.map((d) => d.getHours())).size;

  const ctx: RuleContext = {
    total,
    distinctDrinks,
    countByDrink,
    hour,
    allDrinkIds,
    dayTotal,
    streakDays,
    dayOfWeek,
    distinctStations,
    distinctTags,
    tagTotal,
    longestStreak,
    activeDays,
    distinctHours,
  };

  const awarded: AwardedBadge[] = [];
  for (const ach of achievements) {
    if (have.has(ach.id)) continue;
    if (!meetsRule(ach, ctx)) continue;
    try {
      await prisma.userAchievement.create({ data: { userId, achievementId: ach.id } });
      awarded.push({ key: ach.key, name: ach.name, icon: ach.icon });
    } catch {
      // unik-konflikt ved samtidige tapp – ignorer
    }
  }
  return awarded;
}

type RuleContext = {
  total: number;
  distinctDrinks: number;
  countByDrink: Map<number, number>;
  hour: number;
  allDrinkIds: number[];
  dayTotal: number;
  streakDays: number;
  dayOfWeek: number; // 0=søndag … 6=lørdag
  distinctStations: number;
  distinctTags: number;
  tagTotal: number;
  longestStreak: number;
  activeDays: number;
  distinctHours: number;
};

type RuleInput = { ruleType: string; threshold: number; drinkId: number | null };

/** Avgjør om en bruker oppfyller kriteriet for et merke. Eksportert for testing/gjenbruk. */
export function meetsRule(rule: RuleInput, ctx: RuleContext): boolean {
  switch (rule.ruleType) {
    case "total":
      return ctx.total >= rule.threshold;
    case "distinct":
      return ctx.distinctDrinks >= rule.threshold;
    case "drink":
      return rule.drinkId != null && (ctx.countByDrink.get(rule.drinkId) ?? 0) >= rule.threshold;
    case "before_hour":
      return ctx.hour < rule.threshold;
    case "after_hour":
      return ctx.hour >= rule.threshold;
    case "drink_each":
      // minst `threshold` av HVER aktive drikke
      return (
        ctx.allDrinkIds.length > 0 &&
        ctx.allDrinkIds.every((id) => (ctx.countByDrink.get(id) ?? 0) >= rule.threshold)
      );
    case "streak":
      return ctx.streakDays >= rule.threshold;
    case "day_total":
      return ctx.dayTotal >= rule.threshold;
    case "weekend":
      return ctx.dayOfWeek === 0 || ctx.dayOfWeek === 6;
    case "distinct_station":
      return ctx.distinctStations >= rule.threshold;
    case "distinct_tag":
      return ctx.distinctTags >= rule.threshold;
    case "tag_total":
      return ctx.tagTotal >= rule.threshold;
    case "longest_streak":
      return ctx.longestStreak >= rule.threshold;
    case "active_days":
      return ctx.activeDays >= rule.threshold;
    case "hour_slots":
      return ctx.distinctHours >= rule.threshold;
    case "at_hour":
      return ctx.hour === rule.threshold;
    default:
      return false;
  }
}
