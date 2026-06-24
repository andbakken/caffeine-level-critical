import { prisma } from "@/lib/db";
import { createSession, verifyPin } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/http";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Ugyldig forespørsel");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail("Fyll inn kallenavn og PIN");

  const { nickname, pin } = parsed.data;
  const user = await prisma.user.findUnique({ where: { nickname } });
  // pinHash kan være null for e-post-admin (logger inn via magic-link, ikke PIN).
  if (!user || !user.isActive || !user.pinHash || !verifyPin(pin, user.pinHash)) {
    return fail("Feil kallenavn eller PIN", 401);
  }

  await createSession(user.id);
  return ok({ user: { id: user.id, nickname: user.nickname } });
}
