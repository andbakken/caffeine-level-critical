import { getOverview } from "@/lib/stats";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const deptParam = url.searchParams.get("dept");
  const deptFilter = deptParam ? Number(deptParam) || null : null;
  const data = await getOverview(deptFilter);
  return json(data);
}
