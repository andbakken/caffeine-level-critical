import { prisma } from "@/lib/db";
import { createSession, verifyPin } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit, clientIp, tooManyFailures, recordFailure, clearFailures } from "@/lib/rateLimit";
import { fail, ok } from "@/lib/http";

const ACCOUNT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  // Bred brems per IP mot hamring (alle forsøk teller).
  if (!rateLimit(`login:ip:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
    return fail("For mange forsøk – prøv igjen om litt", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Ugyldig forespørsel");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail("Fyll inn kallenavn og PIN");

  const { nickname, pin } = parsed.data;
  const accountKey = `login:acct:${nickname.toLowerCase()}`;

  // Målrettet brems: for mange feilforsøk mot denne kontoen → blokkér midlertidig.
  if (tooManyFailures(accountKey, 8, ACCOUNT_WINDOW_MS)) {
    return fail("For mange forsøk – prøv igjen senere", 429);
  }

  const user = await prisma.user.findUnique({ where: { nickname } });
  // pinHash kan være null for e-post-admin (logger inn via magic-link, ikke PIN).
  if (!user || !user.isActive || !user.pinHash || !verifyPin(pin, user.pinHash)) {
    recordFailure(accountKey, ACCOUNT_WINDOW_MS);
    return fail("Feil kallenavn eller PIN", 401);
  }

  clearFailures(accountKey); // vellykket innlogging nullstiller
  await createSession(user.id);
  return ok({ user: { id: user.id, nickname: user.nickname } });
}
