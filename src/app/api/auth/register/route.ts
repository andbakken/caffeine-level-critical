import { prisma } from "@/lib/db";
import { createSession, hashPin } from "@/lib/auth";
import { registerSchema, validatePin } from "@/lib/validation";
import { isInviteRequired, inviteCodeMatches } from "@/lib/orgProfile";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { fail, ok } from "@/lib/http";

export async function POST(req: Request) {
  // Rate-limit per IP: hindrer brute-force av invitasjonskoden (og spam-registrering).
  if (!rateLimit(`register:${clientIp(req)}`, 10, 10 * 60 * 1000)) {
    return fail("For mange forsøk – prøv igjen om litt", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Ugyldig forespørsel");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Ugyldige data");
  }
  const { nickname, pin, departmentId, inviteCode } = parsed.data;

  // Styrkekrav på PIN (6 sifre + ingen trivielle på tenant, 4 på selvhost).
  const pinError = validatePin(pin);
  if (pinError) return fail(pinError);

  // Hostet drift: krev en gyldig invitasjonskode fra admin før registrering.
  if (isInviteRequired()) {
    if (!inviteCode || !(await inviteCodeMatches(inviteCode))) {
      return fail("Ugyldig invitasjonskode", 403);
    }
  }

  const dept = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!dept) return fail("Ukjent avdeling");

  const existing = await prisma.user.findUnique({ where: { nickname } });
  if (existing) return fail("Kallenavnet er allerede tatt", 409);

  const user = await prisma.user.create({
    data: { nickname, pinHash: hashPin(pin), departmentId },
  });

  await createSession(user.id);
  return ok({ user: { id: user.id, nickname: user.nickname } });
}
