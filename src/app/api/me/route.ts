import { prisma } from "@/lib/db";
import { getCurrentUser, hashPin } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/http";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Du må være innlogget", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Ugyldig forespørsel");
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Ugyldige data");
  }
  const { nickname, departmentId, pin } = parsed.data;

  const data: { nickname?: string; departmentId?: number; pinHash?: string } = {};

  if (nickname && nickname !== user.nickname) {
    const taken = await prisma.user.findUnique({ where: { nickname } });
    if (taken) return fail("Kallenavnet er allerede tatt", 409);
    data.nickname = nickname;
  }
  if (departmentId && departmentId !== user.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) return fail("Ukjent avdeling");
    data.departmentId = departmentId;
  }
  if (pin) data.pinHash = hashPin(pin);

  if (Object.keys(data).length === 0) return ok({ unchanged: true });

  await prisma.user.update({ where: { id: user.id }, data });
  return ok();
}
