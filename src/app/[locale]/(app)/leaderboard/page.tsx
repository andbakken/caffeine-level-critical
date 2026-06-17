import { getTranslations } from "next-intl/server";
import { getLeaderboard, getDepartmentTree } from "@/lib/stats";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const [rows, deptTree, t] = await Promise.all([
    getLeaderboard("today", "user"),
    getDepartmentTree(),
    getTranslations("Leaderboard"),
  ]);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="heading text-gold text-xl">🏆 {t("title")}</h1>
      <LeaderboardBoard initialRows={rows} deptTree={deptTree} storageKey="bq.leaderboard.dept" />
    </div>
  );
}
