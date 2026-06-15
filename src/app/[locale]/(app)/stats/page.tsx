import { getTranslations } from "next-intl/server";
import { getOverview, getLeaderboard } from "@/lib/stats";
import { Dashboard } from "@/components/Dashboard";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [overview, rows, t] = await Promise.all([
    getOverview(),
    getLeaderboard("all", "user"),
    getTranslations("Stats"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="heading text-gold text-xl">📊 {t("title")}</h1>
      <Dashboard initial={overview} />
      <section>
        <h2 className="heading text-accent-2 text-base mb-3">{t("bestList")}</h2>
        <LeaderboardBoard initialRows={rows} />
      </section>
    </div>
  );
}
