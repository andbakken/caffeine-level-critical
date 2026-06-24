import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/db";

// Passordløs admin-innlogging. Råtoken ligger kun i e-postlenken; databasen lagrer
// bare sha256(token). Token er kortlevd (15 min) og kan brukes én gang.

const TOKEN_TTL_MS = 15 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Lager et engangstoken for brukeren og returnerer RÅtoken (legges i e-postlenke). */
export async function createLoginToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.loginToken.create({
    data: {
      id: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return token;
}

/** Løser inn et token. Returnerer userId ved gyldig + ubrukt + ikke utløpt, ellers null. */
export async function consumeLoginToken(token: string): Promise<number | null> {
  const id = hashToken(token);
  const row = await prisma.loginToken.findUnique({ where: { id } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;

  // Marker brukt med en gang (engangsbruk). Race-trygt nok for vårt volum.
  await prisma.loginToken.update({ where: { id }, data: { usedAt: new Date() } });
  return row.userId;
}
