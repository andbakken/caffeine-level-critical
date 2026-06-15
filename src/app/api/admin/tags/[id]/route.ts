import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);

  const id = Number((await ctx.params).id);
  if (!id) return fail("Ugyldig id");

  // koble fra forbruk før sletting (behold historikk)
  await prisma.consumption.updateMany({ where: { tagId: id }, data: { tagId: null } });
  await prisma.stationTag.delete({ where: { id } });
  return ok();
}
