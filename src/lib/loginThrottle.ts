import { prisma } from "@/lib/db";

// Vedvarende feil-teller for innlogging, per konto.
//
// Hvorfor DB og ikke minne: hver utrulling re-skaper tenant-containerne
// (control-plane/src/rollout.ts), og en in-memory teller ville nullstilt låsen
// hver gang. En angriper trenger ikke engang utnytte det bevisst – det skjer av
// seg selv ved neste deploy. IP-burst-grensen i src/lib/rateLimit.ts står
// fortsatt i minne; den skal være billig og er ikke det som beskytter kontoen.

const WINDOW_MS = 15 * 60 * 1000; // feil eldre enn dette teller ikke lenger
const MAX_FAILS = 8; // feil i vinduet før lås slår inn

/** Låsevarighet som vokser: 5 min, 15, 60, deretter 4 timer. Gjør vedvarende
 *  gjetting dyr uten å låse ute en ekte bruker som bommet noen ganger. */
function lockMs(lockCount: number): number {
  const steps = [5, 15, 60, 240];
  return steps[Math.min(lockCount, steps.length - 1)] * 60 * 1000;
}

export function throttleKey(nickname: string): string {
  return `login:acct:${nickname.trim().toLowerCase()}`;
}

/** Er kontoen låst nå? Returnerer sekunder igjen, eller 0 når den er åpen. */
export async function lockedFor(key: string): Promise<number> {
  const row = await prisma.loginThrottle.findUnique({ where: { key } });
  if (!row?.lockedUntil) return 0;
  const left = row.lockedUntil.getTime() - Date.now();
  return left > 0 ? Math.ceil(left / 1000) : 0;
}

/** Registrer ett feilforsøk. Låser kontoen når grensen er nådd. */
export async function recordFailure(key: string): Promise<void> {
  const now = new Date();
  const row = await prisma.loginThrottle.findUnique({ where: { key } });

  // Nytt vindu: enten første feil, eller forrige vindu er utløpt.
  if (!row || now.getTime() - row.windowStart.getTime() > WINDOW_MS) {
    await prisma.loginThrottle.upsert({
      where: { key },
      create: { key, fails: 1, windowStart: now },
      update: { fails: 1, windowStart: now, lockedUntil: null },
    });
    return;
  }

  const fails = row.fails + 1;
  if (fails < MAX_FAILS) {
    await prisma.loginThrottle.update({ where: { key }, data: { fails } });
    return;
  }

  // Grensen nådd → lås. Hvor mange ganger kontoen har vært låst før avgjør
  // varigheten; vi utleder det av hvor mange hele MAX_FAILS-bolker som er talt.
  const lockCount = Math.floor(fails / MAX_FAILS) - 1;
  await prisma.loginThrottle.update({
    where: { key },
    data: { fails, lockedUntil: new Date(now.getTime() + lockMs(lockCount)) },
  });
}

/** Nullstill etter vellykket innlogging. */
export async function clearFailures(key: string): Promise<void> {
  await prisma.loginThrottle.deleteMany({ where: { key } });
}
