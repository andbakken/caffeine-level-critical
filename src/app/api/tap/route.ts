import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logConsumption } from "@/lib/consumption";
import { drinkKeySchema } from "@/lib/validation";
import { fail, json, ok } from "@/lib/http";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Du må være innlogget", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Ugyldig forespørsel");
  }
  const { token, drinkKey } = (body ?? {}) as { token?: unknown; drinkKey?: unknown };

  const tokenStr = typeof token === "string" ? token : "";
  const tag = await prisma.stationTag.findUnique({
    where: { token: tokenStr },
    include: { drink: true },
  });
  if (!tag) return fail("Ukjent tagg", 404);

  let drinkId = tag.drinkId ?? null;
  if (!drinkId) {
    const key = drinkKeySchema.safeParse(drinkKey);
    if (!key.success) return fail("Velg en drikke");
    const drink = await prisma.drink.findUnique({ where: { key: key.data } });
    if (!drink) return fail("Ukjent drikke");
    drinkId = drink.id;
  }

  const result = await logConsumption({
    userId: user.id,
    drinkId,
    source: "tag",
    stationId: tag.stationId,
    tagId: tag.id,
  });

  const drink = await prisma.drink.findUnique({ where: { id: drinkId } });
  if (!result.created) {
    return json({ ok: true, cooldown: true, message: "Allerede registrert nettopp 😅" });
  }
  return ok({
    drink: drink ? { key: drink.key, displayName: drink.displayName, icon: drink.icon } : null,
    newBadges: result.newBadges,
  });
}
