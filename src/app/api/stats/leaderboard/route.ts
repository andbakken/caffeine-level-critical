import { getLeaderboard } from "@/lib/stats";
import { parsePeriod } from "@/lib/time";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = parsePeriod(url.searchParams.get("period"));
  const groupByParam = url.searchParams.get("groupBy");
  const groupBy = groupByParam === "department" ? "department" : "user";

  const rows = await getLeaderboard(period, groupBy);
  return json({ period, groupBy, rows });
}
