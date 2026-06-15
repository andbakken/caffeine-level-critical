import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { RULE_TYPES, type RuleType } from "@/lib/achievements";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const icon = String(body.icon ?? "").trim();
  const ruleType = String(body.ruleType ?? "total");
  const threshold = Math.trunc(Number(body.threshold));
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Math.trunc(Number(body.sortOrder)) : 0;

  if (!name) return fail("Mangler navn");
  if (!icon) return fail("Mangler ikon");
  if (!RULE_TYPES.includes(ruleType as RuleType)) return fail("Ugyldig regeltype");
  if (!Number.isFinite(threshold) || threshold < 1) return fail("Terskel må være minst 1");

  let drinkId: number | null = null;
  if (ruleType === "drink") {
    drinkId = Number(body.drinkId);
    if (!drinkId) return fail("Velg drikke for denne regelen");
    const drink = await prisma.drink.findUnique({ where: { id: drinkId } });
    if (!drink) return fail("Ukjent drikke");
  }

  const baseSlug = slugify(name) || `merke-${Date.now()}`;
  let key = baseSlug;
  if (await prisma.achievement.findUnique({ where: { key } })) {
    key = `${baseSlug}-${Date.now().toString(36)}`;
  }

  const achievement = await prisma.achievement.create({
    data: { key, name, description, icon, ruleType, threshold, drinkId, sortOrder },
  });
  return ok({ achievement });
}
