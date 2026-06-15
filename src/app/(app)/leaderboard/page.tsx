import { getLeaderboard } from "@/lib/stats";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const rows = await getLeaderboard("today", "user");
  return (
    <div className="flex flex-col gap-5">
      <h1 className="heading text-gold text-xl">🏆 Toppliste</h1>
      <LeaderboardBoard initialRows={rows} />
    </div>
  );
}
