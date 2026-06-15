import { getTranslations } from "next-intl/server";
import { getLeaderboard } from "@/lib/stats";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const [rows, t] = await Promise.all([
    getLeaderboard("today", "user"),
    getTranslations("Leaderboard"),
  ]);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="heading text-gold text-xl">🏆 {t("title")}</h1>
      <LeaderboardBoard initialRows={rows} />
    </div>
  );
}
