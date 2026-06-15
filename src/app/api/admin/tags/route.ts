import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);

  const body = (await req.json().catch(() => ({}))) as {
    stationId?: number;
    drinkId?: number | null;
    label?: string;
  };
  const stationId = Number(body.stationId);
  if (!stationId) return fail("Velg stasjon");

  const station = await prisma.station.findUnique({ where: { id: stationId } });
  if (!station) return fail("Ukjent stasjon");

  let drinkId: number | null = null;
  if (body.drinkId) {
    const drink = await prisma.drink.findUnique({ where: { id: Number(body.drinkId) } });
    if (!drink) return fail("Ukjent drikke");
    drinkId = drink.id;
  }

  const token = randomBytes(5).toString("hex");
  const tag = await prisma.stationTag.create({
    data: { token, stationId, drinkId, label: (body.label ?? "").trim() || null },
  });
  return ok({ tag });
}
