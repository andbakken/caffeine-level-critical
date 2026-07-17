import { prisma } from "@/lib/db";
import { createSession, verifyPin } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { throttleKey, lockedFor, recordFailure, clearFailures } from "@/lib/loginThrottle";
import { fail, ok } from "@/lib/http";

export async function POST(req: Request) {
  // Bred brems per IP mot hamring (alle forsøk teller). Bevisst i minne: billig,
  // og det er konto-låsen under som faktisk beskytter kontoen.
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
  const accountKey = throttleKey(nickname);

  // Målrettet brems: for mange feilforsøk mot denne kontoen → lås midlertidig.
  // Låsen ligger i DB, så den overlever at containeren re-skapes ved utrulling.
  const locked = await lockedFor(accountKey);
  if (locked > 0) {
    const min = Math.ceil(locked / 60);
    return fail(`For mange forsøk – prøv igjen om ${min} minutt${min === 1 ? "" : "er"}`, 429);
  }

  const user = await prisma.user.findUnique({ where: { nickname } });
  // pinHash kan være null for e-post-admin (logger inn via magic-link, ikke PIN).
  if (!user || !user.isActive || !user.pinHash || !verifyPin(pin, user.pinHash)) {
    await recordFailure(accountKey);
    return fail("Feil kallenavn eller PIN", 401);
  }

  await clearFailures(accountKey); // vellykket innlogging nullstiller
  await createSession(user.id);
  return ok({ user: { id: user.id, nickname: user.nickname } });
}
