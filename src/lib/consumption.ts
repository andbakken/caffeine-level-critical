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

async function evaluateAchievements(userId: number, at: Date): Promise<AwardedBadge[]> {
  const [total, grouped, already, achievements] = await Promise.all([
    prisma.consumption.count({ where: { userId } }),
    prisma.consumption.groupBy({ by: ["drinkId"], where: { userId }, _count: { _all: true } }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
    prisma.achievement.findMany({ where: { isActive: true } }),
  ]);

  const distinctDrinks = grouped.length;
  const countByDrink = new Map(grouped.map((g) => [g.drinkId, g._count._all]));
  const hour = at.getHours();
  const have = new Set(already.map((a) => a.achievementId));

  const awarded: AwardedBadge[] = [];
  for (const ach of achievements) {
    if (have.has(ach.id)) continue;
    if (!meetsRule(ach, { total, distinctDrinks, countByDrink, hour })) continue;
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
    default:
      return false;
  }
}
