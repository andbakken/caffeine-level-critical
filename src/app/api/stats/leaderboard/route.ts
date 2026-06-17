import { getLeaderboard } from "@/lib/stats";
import { parsePeriod } from "@/lib/time";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = parsePeriod(url.searchParams.get("period"));
  const groupByParam = url.searchParams.get("groupBy");
  const groupBy = groupByParam === "department" ? "department" : "user";
  const deptParam = url.searchParams.get("dept");
  const deptFilter = deptParam ? Number(deptParam) || null : null;

  const rows = await getLeaderboard(period, groupBy, deptFilter);
  return json({ period, groupBy, deptFilter, rows });
}
