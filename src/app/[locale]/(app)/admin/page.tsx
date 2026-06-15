import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AdminClient } from "@/components/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/");

  const [departments, stations, drinks, tags, achievements] = await Promise.all([
    prisma.department.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { users: true } } },
    }),
    prisma.station.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { tags: true, consumptions: true } } },
    }),
    prisma.drink.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.stationTag.findMany({
      orderBy: { createdAt: "desc" },
      include: { station: true, drink: true, _count: { select: { consumptions: true } } },
    }),
    prisma.achievement.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      include: { drink: true, _count: { select: { users: true } } },
    }),
  ]);

  return (
    <AdminClient
      departments={departments.map((d) => ({
        id: d.id,
        name: d.name,
        color: d.color,
        userCount: d._count.users,
      }))}
      stations={stations.map((s) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        color: s.color,
        tagCount: s._count.tags,
        consumptionCount: s._count.consumptions,
      }))}
      drinks={drinks.map((d) => ({
        id: d.id,
        displayName: d.displayName,
        icon: d.icon,
      }))}
      tags={tags.map((t) => ({
        id: t.id,
        token: t.token,
        label: t.label,
        stationName: t.station.name,
        drink: t.drink ? { icon: t.drink.icon, displayName: t.drink.displayName } : null,
        scanCount: t._count.consumptions,
      }))}
      achievements={achievements.map((a) => ({
        id: a.id,
        key: a.key,
        name: a.name,
        description: a.description,
        icon: a.icon,
        ruleType: a.ruleType,
        threshold: a.threshold,
        drinkId: a.drinkId,
        sortOrder: a.sortOrder,
        isActive: a.isActive,
        earnedCount: a._count.users,
      }))}
    />
  );
}
