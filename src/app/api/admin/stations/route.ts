import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);

  const body = (await req.json().catch(() => ({}))) as { name?: string; location?: string };
  const name = (body.name ?? "").trim();
  if (!name) return fail("Mangler navn");

  const station = await prisma.station.create({
    data: { name, location: (body.location ?? "").trim() || null },
  });
  return ok({ station });
}
