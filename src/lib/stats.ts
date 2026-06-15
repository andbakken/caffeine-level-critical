import { prisma } from "@/lib/db";
import { periodStart, type Period } from "@/lib/time";

export type LeaderboardRow = {
  rank: number;
  id: number;
  name: string;
  color: string;
  avatarPath?: string | null;
  departmentName?: string;
  count: number;
};

export async function getLeaderboard(period: Period, groupBy: "user" | "department") {
  const since = periodStart(period);
  const where = since ? { createdAt: { gte: since } } : {};

  const grouped = await prisma.consumption.groupBy({
    by: ["userId"],
    where,
    _count: { _all: true },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    include: { department: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  if (groupBy === "user") {
    const rows = grouped
      .map((g) => {
        const u = userById.get(g.userId);
        return {
          id: g.userId,
          name: u?.nickname ?? "Ukjent",
          color: u?.department.color ?? "#7c5cff",
          avatarPath: u?.avatarPath ?? null,
          departmentName: u?.department.name,
          count: g._count._all,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);
    return rows.map((r, i) => ({ rank: i + 1, ...r }));
  }

  // department aggregation
  const deptTotals = new Map<number, number>();
  for (const g of grouped) {
    const u = userById.get(g.userId);
    if (!u) continue;
    deptTotals.set(u.departmentId, (deptTotals.get(u.departmentId) ?? 0) + g._count._all);
  }
  const depts = await prisma.department.findMany();
  const rows = depts
    .map((d) => ({
      id: d.id,
      name: d.name,
      color: d.color,
      count: deptTotals.get(d.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);
  return rows.map((r, i) => ({ rank: i + 1, ...r }));
}

export async function getOverview() {
  const today = periodStart("today")!;
  const week = periodStart("week")!;

  const [totalAll, totalToday, totalWeek, drinks, byDrinkToday, recentRaw] = await Promise.all([
    prisma.consumption.count(),
    prisma.consumption.count({ where: { createdAt: { gte: today } } }),
    prisma.consumption.count({ where: { createdAt: { gte: week } } }),
    prisma.drink.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.consumption.groupBy({
      by: ["drinkId"],
      where: { createdAt: { gte: today } },
      _count: { _all: true },
    }),
    prisma.consumption.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        user: { include: { department: true } },
        drink: true,
        station: true,
      },
    }),
  ]);

  const todayByDrink = new Map(byDrinkToday.map((d) => [d.drinkId, d._count._all]));
  const drinkStats = drinks.map((d) => ({
    key: d.key,
    displayName: d.displayName,
    icon: d.icon,
    color: d.color,
    today: todayByDrink.get(d.id) ?? 0,
  }));

  const recent = recentRaw.map((c) => ({
    id: c.id,
    nickname: c.user.nickname,
    deptColor: c.user.department.color,
    drinkIcon: c.drink.icon,
    drinkName: c.drink.displayName,
    source: c.source,
    station: c.station?.name ?? null,
    createdAt: c.createdAt.toISOString(),
  }));

  // siste 7 dager (inkl. i dag)
  const last7: { label: string; count: number }[] = [];
  const dayNames = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const count = await prisma.consumption.count({
      where: { createdAt: { gte: start, lt: end } },
    });
    last7.push({ label: dayNames[start.getDay()], count });
  }

  return { totalAll, totalToday, totalWeek, drinkStats, recent, last7 };
}

export type Overview = Awaited<ReturnType<typeof getOverview>>;
