import { getOverview } from "@/lib/stats";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getOverview();
  return json(data);
}
