import { getOverview, getLeaderboard } from "@/lib/stats";
import { Dashboard } from "@/components/Dashboard";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [overview, rows] = await Promise.all([
    getOverview(),
    getLeaderboard("all", "user"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="heading text-gold text-xl">📊 Statistikk</h1>
      <Dashboard initial={overview} />
      <section>
        <h2 className="heading text-accent-2 text-base mb-3">Bestenliste</h2>
        <LeaderboardBoard initialRows={rows} />
      </section>
    </div>
  );
}
