import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { periodStart, type Period } from "@/lib/time";

export type LeaderboardRow = {
  rank: number;
  id: number;
  name: string;
  color: string;
  avatarPath?: string | null;
  departmentName?: string;
  count: number;
  // Kun for groupBy="department": gjør at klienten kan rendre tre med utvid/skjul.
  parentId?: number | null;
  depth?: number;
  hasChildren?: boolean;
};

export type DeptTreeItem = {
  id: number;
  name: string;
  color: string;
  parentId: number | null;
  depth: number;
};

type DeptRef = { id: number; parentId: number | null };

// Subtre-id-er (inkludert avdelingen selv) gitt en flat liste over alle avdelinger.
function descendantIds(rootId: number, all: DeptRef[]): number[] {
  const byParent = new Map<number | null, number[]>();
  for (const d of all) {
    const arr = byParent.get(d.parentId) ?? [];
    arr.push(d.id);
    byParent.set(d.parentId, arr);
  }
  const out: number[] = [];
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    out.push(id);
    for (const childId of byParent.get(id) ?? []) stack.push(childId);
  }
  return out;
}

// Flat liste i tre-rekkefølge (forelder før barn) med innrykksdybde — brukes av
// avdelingsfilteret (indentert nedtrekk).
export async function getDepartmentTree(): Promise<DeptTreeItem[]> {
  const all = await prisma.department.findMany({ orderBy: { name: "asc" } });
  const byParent = new Map<number | null, typeof all>();
  for (const d of all) {
    const arr = byParent.get(d.parentId) ?? [];
    arr.push(d);
    byParent.set(d.parentId, arr);
  }
  const out: DeptTreeItem[] = [];
  const walk = (parentId: number | null, depth: number) => {
    for (const d of byParent.get(parentId) ?? []) {
      out.push({ id: d.id, name: d.name, color: d.color, parentId: d.parentId, depth });
      walk(d.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

export async function getLeaderboard(
  period: Period,
  groupBy: "user" | "department",
  deptFilter?: number | null,
) {
  const since = periodStart(period);
  const allDepts = await prisma.department.findMany();
  const subtree = deptFilter ? descendantIds(deptFilter, allDepts) : null;

  const where: Prisma.ConsumptionWhereInput = {};
  if (since) where.createdAt = { gte: since };
  if (subtree) where.user = { departmentId: { in: subtree } };

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

  // --- Avdelings-aggregering med opprulling til foreldre ---
  // Direkte total per avdeling (kun brukerne som tilhører avdelingen selv).
  const directTotal = new Map<number, number>();
  for (const g of grouped) {
    const u = userById.get(g.userId);
    if (!u) continue;
    directTotal.set(u.departmentId, (directTotal.get(u.departmentId) ?? 0) + g._count._all);
  }
  // Opprullet total per avdeling = sum over hele subtreet.
  const rolled = new Map<number, number>();
  for (const d of allDepts) {
    let sum = 0;
    for (const id of descendantIds(d.id, allDepts)) sum += directTotal.get(id) ?? 0;
    rolled.set(d.id, sum);
  }

  const byParent = new Map<number | null, typeof allDepts>();
  for (const d of allDepts) {
    const arr = byParent.get(d.parentId) ?? [];
    arr.push(d);
    byParent.set(d.parentId, arr);
  }
  const hasChildren = (id: number) => (byParent.get(id)?.length ?? 0) > 0;

  const rows: LeaderboardRow[] = [];
  // Søsken sorteres på opprullet total; rang tildeles innen hvert søskenkull.
  const walk = (parentId: number | null, depth: number) => {
    const sibs = (byParent.get(parentId) ?? [])
      .slice()
      .sort((a, b) => (rolled.get(b.id) ?? 0) - (rolled.get(a.id) ?? 0));
    sibs.forEach((d, i) => {
      rows.push({
        rank: i + 1,
        id: d.id,
        name: d.name,
        color: d.color,
        count: rolled.get(d.id) ?? 0,
        parentId: d.parentId,
        depth,
        hasChildren: hasChildren(d.id),
      });
      walk(d.id, depth + 1);
    });
  };

  if (deptFilter) {
    const root = allDepts.find((d) => d.id === deptFilter);
    if (root) {
      rows.push({
        rank: 1,
        id: root.id,
        name: root.name,
        color: root.color,
        count: rolled.get(root.id) ?? 0,
        parentId: root.parentId,
        depth: 0,
        hasChildren: hasChildren(root.id),
      });
      walk(root.id, 1);
    }
  } else {
    walk(null, 0);
  }
  return rows;
}

export async function getOverview(deptFilter?: number | null) {
  const today = periodStart("today")!;
  const week = periodStart("week")!;

  const subtree = deptFilter
    ? descendantIds(deptFilter, await prisma.department.findMany())
    : null;
  const deptWhere: Prisma.ConsumptionWhereInput = subtree
    ? { user: { departmentId: { in: subtree } } }
    : {};

  const [totalAll, totalToday, totalWeek, drinks, byDrinkToday, recentRaw] = await Promise.all([
    prisma.consumption.count({ where: { ...deptWhere } }),
    prisma.consumption.count({ where: { ...deptWhere, createdAt: { gte: today } } }),
    prisma.consumption.count({ where: { ...deptWhere, createdAt: { gte: week } } }),
    prisma.drink.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.consumption.groupBy({
      by: ["drinkId"],
      where: { ...deptWhere, createdAt: { gte: today } },
      _count: { _all: true },
    }),
    prisma.consumption.findMany({
      where: { ...deptWhere },
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
      where: { ...deptWhere, createdAt: { gte: start, lt: end } },
    });
    last7.push({ label: dayNames[start.getDay()], count });
  }

  return { totalAll, totalToday, totalWeek, drinkStats, recent, last7 };
}

export type Overview = Awaited<ReturnType<typeof getOverview>>;
