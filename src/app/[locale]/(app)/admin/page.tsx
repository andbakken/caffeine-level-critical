import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getOrgProfile, isInviteRequired, getInviteCode } from "@/lib/orgProfile";
import { AdminClient } from "@/components/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/dashboard");

  const [departments, stations, drinks, tags, achievements, users, branding] = await Promise.all([
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
    prisma.user.findMany({
      orderBy: { nickname: "asc" },
      include: { department: true, _count: { select: { consumptions: true } } },
    }),
    getOrgProfile(),
  ]);

  const requireInvite = isInviteRequired();
  const inviteCode = requireInvite ? await getInviteCode() : null;

  return (
    <AdminClient
      currentUserId={user.id}
      branding={{ ...branding, requireInvite, inviteCode }}
      users={users.map((u) => ({
        id: u.id,
        nickname: u.nickname,
        departmentId: u.departmentId,
        departmentName: u.department.name,
        departmentColor: u.department.color,
        avatarPath: u.avatarPath,
        isActive: u.isActive,
        isAdmin: u.isAdmin,
        cupCount: u._count.consumptions,
      }))}
      departments={departments.map((d) => ({
        id: d.id,
        name: d.name,
        color: d.color,
        parentId: d.parentId,
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
