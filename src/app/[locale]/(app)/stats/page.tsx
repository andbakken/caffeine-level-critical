import { getTranslations } from "next-intl/server";
import { getOverview, getLeaderboard, getDepartmentTree } from "@/lib/stats";
import { StatsClient } from "@/components/StatsClient";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [overview, rows, deptTree, t] = await Promise.all([
    getOverview(),
    getLeaderboard("all", "user"),
    getDepartmentTree(),
    getTranslations("Stats"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="heading text-gold text-xl">📊 {t("title")}</h1>
      <StatsClient overview={overview} leaderboardRows={rows} deptTree={deptTree} />
    </div>
  );
}
