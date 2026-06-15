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

  const key = drinkKeySchema.safeParse((body as { drinkKey?: unknown })?.drinkKey);
  if (!key.success) return fail("Mangler drikke");

  const drink = await prisma.drink.findUnique({ where: { key: key.data } });
  if (!drink) return fail("Ukjent drikke");

  const result = await logConsumption({
    userId: user.id,
    drinkId: drink.id,
    source: "web",
  });

  if (!result.created) {
    return json({ ok: true, cooldown: true, message: "Allerede registrert nettopp 😅" });
  }
  return ok({ drink: { key: drink.key, displayName: drink.displayName, icon: drink.icon }, newBadges: result.newBadges });
}
