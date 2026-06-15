import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getOverview, getLeaderboard } from "@/lib/stats";
import { Dashboard } from "@/components/Dashboard";
import { QuickLog } from "@/components/QuickLog";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [user, overview, drinks, topToday] = await Promise.all([
    getCurrentUser(),
    getOverview(),
    prisma.drink.findMany({ orderBy: { sortOrder: "asc" } }),
    getLeaderboard("today", "user"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section className="text-center py-4">
        <h1 className="heading text-gold text-2xl sm:text-4xl">☕ BrewQuest</h1>
        <p className="text-ink-dim mt-3">
          Hvem drikker mest på IT-avdelingen? Skann en kopp og finn ut.
        </p>
      </section>

      {user ? (
        <section>
          <h2 className="heading text-accent-2 text-base mb-3">
            Hei {user.nickname} — logg en kopp
          </h2>
          <QuickLog
            drinks={drinks.map((d) => ({
              key: d.key,
              displayName: d.displayName,
              icon: d.icon,
              color: d.color,
            }))}
          />
        </section>
      ) : (
        <section className="pixel-panel p-5 text-center flex flex-col gap-3 items-center">
          <p>Lag en profil for å logge dine egne kopper og samle merker!</p>
          <div className="flex gap-3">
            <Link href="/register" className="pixel-btn">
              Bli med
            </Link>
            <Link href="/login" className="pixel-btn pixel-btn-ghost">
              Logg inn
            </Link>
          </div>
        </section>
      )}

      <Dashboard initial={overview} />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="heading text-accent-2 text-base">Dagens topp</h2>
          <Link href="/leaderboard" className="text-base text-accent hover:underline">
            Se hele →
          </Link>
        </div>
        <LeaderboardBoard initialRows={topToday.slice(0, 5)} compact />
      </section>
    </div>
  );
}
