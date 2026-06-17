import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

// Subtre-id-er (inkl. seg selv) — for å hindre sykler ved omhenging av forelder.
function descendantIds(rootId: number, all: { id: number; parentId: number | null }[]): number[] {
  const byParent = new Map<number | null, number[]>();
  for (const d of all) {
    const arr = byParent.get(d.parentId) ?? [];
    arr.push(d.id);
    byParent.set(d.parentId, arr);
  }
  const out: number[] = [];
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    out.push(id);
    for (const childId of byParent.get(id) ?? []) stack.push(childId);
  }
  return out;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);

  const id = Number((await ctx.params).id);
  if (!id) return fail("Ugyldig id");

  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) return fail("Avdeling finnes ikke", 404);

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    color?: string;
    parentId?: number | null;
  };

  const data: { name?: string; color?: string; parentId?: number | null } = {};

  if (body.name != null) {
    const name = body.name.trim();
    if (!name) return fail("Mangler navn");
    data.name = name;
  }
  if (body.color != null && body.color.trim()) {
    data.color = body.color.trim();
  }
  if (body.parentId !== undefined) {
    const parentId = body.parentId == null ? null : Number(body.parentId) || null;
    if (parentId != null) {
      if (parentId === id) return fail("En avdeling kan ikke være sin egen forelder");
      const parent = await prisma.department.findUnique({ where: { id: parentId } });
      if (!parent) return fail("Foreldreavdeling finnes ikke", 404);
      // Hindre sykel: ny forelder kan ikke ligge i avdelingens eget subtre.
      const all = await prisma.department.findMany({ select: { id: true, parentId: true } });
      if (descendantIds(id, all).includes(parentId)) {
        return fail("Kan ikke flytte avdeling inn under en av sine egne underavdelinger");
      }
    }
    data.parentId = parentId;
  }

  const updated = await prisma.department.update({ where: { id }, data });
  return ok({ department: updated });
}
