import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { RULE_TYPES, type RuleType } from "@/lib/achievements";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);

  const id = Number((await ctx.params).id);
  if (!id) return fail("Ugyldig id");
  const existing = await prisma.achievement.findUnique({ where: { id } });
  if (!existing) return fail("Ukjent merke", 404);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return fail("Mangler navn");
    data.name = name;
  }
  if (body.description !== undefined) data.description = String(body.description).trim();
  if (body.icon !== undefined) {
    const icon = String(body.icon).trim();
    if (!icon) return fail("Mangler ikon");
    data.icon = icon;
  }
  if (body.sortOrder !== undefined) data.sortOrder = Math.trunc(Number(body.sortOrder)) || 0;
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  // ruleType/threshold/drinkId henger sammen — valider samlet
  const ruleType = body.ruleType !== undefined ? String(body.ruleType) : existing.ruleType;
  if (body.ruleType !== undefined) {
    if (!RULE_TYPES.includes(ruleType as RuleType)) return fail("Ugyldig regeltype");
    data.ruleType = ruleType;
  }
  if (body.threshold !== undefined) {
    const threshold = Math.trunc(Number(body.threshold));
    if (!Number.isFinite(threshold) || threshold < 1) return fail("Terskel må være minst 1");
    data.threshold = threshold;
  }
  if (ruleType === "drink") {
    if (body.drinkId !== undefined) {
      const drinkId = Number(body.drinkId);
      if (!drinkId) return fail("Velg drikke for denne regelen");
      const drink = await prisma.drink.findUnique({ where: { id: drinkId } });
      if (!drink) return fail("Ukjent drikke");
      data.drinkId = drinkId;
    } else if (existing.drinkId == null) {
      return fail("Velg drikke for denne regelen");
    }
  } else if (body.ruleType !== undefined) {
    // bytter bort fra drikke-regel — nullstill koblingen
    data.drinkId = null;
  }

  const achievement = await prisma.achievement.update({ where: { id }, data });
  return ok({ achievement });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);

  const id = Number((await ctx.params).id);
  if (!id) return fail("Ugyldig id");

  // fjern opptjente forekomster først (ingen cascade i schema)
  await prisma.userAchievement.deleteMany({ where: { achievementId: id } });
  await prisma.achievement.delete({ where: { id } });
  return ok();
}
