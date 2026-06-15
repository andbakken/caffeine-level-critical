import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { periodStart } from "@/lib/time";
import { MeClient } from "@/components/MeClient";
import { QuickLog } from "@/components/QuickLog";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/me");

  const today = periodStart("today")!;
  const [total, todayCount, grouped, drinks, earned, allAchievements, departments] =
    await Promise.all([
      prisma.consumption.count({ where: { userId: user.id } }),
      prisma.consumption.count({ where: { userId: user.id, createdAt: { gte: today } } }),
      prisma.consumption.groupBy({
        by: ["drinkId"],
        where: { userId: user.id },
        _count: { _all: true },
      }),
      prisma.drink.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.userAchievement.findMany({
        where: { userId: user.id },
        include: { achievement: true },
      }),
      prisma.achievement.findMany(),
      prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);

  const countByDrink = new Map(grouped.map((g) => [g.drinkId, g._count._all]));
  const earnedKeys = new Set(earned.map((e) => e.achievement.key));

  return (
    <div className="flex flex-col gap-8">
      <div className="pixel-panel p-5">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="heading text-gold text-xl">{user.nickname}</h1>
          <span
            className="font-display text-[0.6rem] px-2 py-1"
            style={{ backgroundColor: user.department.color, color: "#0d0b1a" }}
          >
            {user.department.name}
          </span>
        </div>
        <div className="flex gap-6 mt-4">
          <Stat label="Totalt" value={total} />
          <Stat label="I dag" value={todayCount} />
          <Stat label="Merker" value={earnedKeys.size} />
        </div>
        <div className="mt-4 flex gap-4 flex-wrap text-base text-ink-dim">
          {drinks.map((d) => (
            <span key={d.key}>
              {d.icon} {countByDrink.get(d.id) ?? 0}
            </span>
          ))}
        </div>
      </div>

      <section>
        <h2 className="heading text-accent-2 text-base mb-3">Logg en kopp</h2>
        <QuickLog
          drinks={drinks.map((d) => ({
            key: d.key,
            displayName: d.displayName,
            icon: d.icon,
            color: d.color,
          }))}
        />
      </section>

      <section>
        <h2 className="heading text-accent-2 text-base mb-3">Merker</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {allAchievements.map((a) => {
            const has = earnedKeys.has(a.key);
            return (
              <div
                key={a.key}
                className={`pixel-panel p-3 text-center ${has ? "" : "opacity-40 grayscale"}`}
                title={a.description}
              >
                <div className="text-4xl">{has ? a.icon : "🔒"}</div>
                <div className="font-display text-[0.5rem] mt-2 leading-relaxed">{a.name}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="heading text-accent-2 text-base mb-3">Innstillinger</h2>
        <MeClient
          nickname={user.nickname}
          departmentId={user.departmentId}
          avatarPath={user.avatarPath}
          departments={departments}
          color={user.department.color}
        />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl text-gold">{value}</div>
      <div className="text-ink-dim text-sm">{label}</div>
    </div>
  );
}
