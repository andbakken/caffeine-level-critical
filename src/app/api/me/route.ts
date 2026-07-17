import { prisma } from "@/lib/db";
import { getCurrentUser, hashPin } from "@/lib/auth";
import { updateProfileSchema, validatePin } from "@/lib/validation";
import { isTenant } from "@/lib/deployment";
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
  if (pin) {
    // En e-post-admin på tenant logger inn med magic-link. Lar vi hen sette en PIN,
    // byttes en engangslenke til e-post ut med noen få sifre – og kallenavnet er
    // forutsigbart («GameMaster» fra bootstrap), så halve legitimasjonen er kjent.
    // Da er PIN-en netto svekkelse, ikke bekvemmelighet. Selvhost er urørt.
    if (isTenant() && user.email) {
      return fail(
        "Administratorer med e-post logger inn via innloggingslenke på e-post, og kan ikke sette PIN. " +
          "Det er et bevisst valg: en PIN ville vært svakere enn lenken.",
        403,
      );
    }
    const pinError = validatePin(pin);
    if (pinError) return fail(pinError);
    data.pinHash = hashPin(pin);
  }

  if (Object.keys(data).length === 0) return ok({ unchanged: true });

  await prisma.user.update({ where: { id: user.id }, data });
  return ok();
}
