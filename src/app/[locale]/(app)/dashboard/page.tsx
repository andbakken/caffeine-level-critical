import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getOverview, getLeaderboard } from "@/lib/stats";
import { Link } from "@/i18n/navigation";
import { Dashboard } from "@/components/Dashboard";
import { QuickLog } from "@/components/QuickLog";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [user, overview, drinks, topToday, t] = await Promise.all([
    getCurrentUser(),
    getOverview(),
    prisma.drink.findMany({ orderBy: { sortOrder: "asc" } }),
    getLeaderboard("today", "user"),
    getTranslations("Home"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section className="text-center py-4">
        <h1 className="heading text-gold text-2xl sm:text-4xl">☕ Quest of the Roasted Bean</h1>
        <p className="text-ink-dim mt-3">{t("tagline")}</p>
      </section>

      {user ? (
        <section>
          <h2 className="heading text-accent-2 text-base mb-3">
            {t("greeting", { name: user.nickname })}
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
          <p>{t("makeProfile")}</p>
          <div className="flex gap-3">
            <Link href="/register" className="pixel-btn">
              {t("join")}
            </Link>
            <Link href="/login" className="pixel-btn pixel-btn-ghost">
              {t("login")}
            </Link>
          </div>
        </section>
      )}

      <Dashboard initial={overview} />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="heading text-accent-2 text-base">{t("todaysTop")}</h2>
          <Link href="/leaderboard" className="text-base text-accent hover:underline">
            {t("seeAll")}
          </Link>
        </div>
        <LeaderboardBoard initialRows={topToday.slice(0, 5)} compact />
      </section>
    </div>
  );
}
