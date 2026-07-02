import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

// Singleton-rad: appen er én-instans, så all branding bor i én OrgProfile (id=1).
export const ORG_PROFILE_ID = 1;

export type OrgProfile = {
  logoPath: string | null;
  posterHeading: string | null;
  posterBody: string | null;
};

// Henter branding-profilen, og oppretter en tom rad første gang. Default-tekster
// for plakaten er lokaliserte og bor i i18n (Poster.defaultHeading/defaultBody) —
// her returnerer vi bare det admin faktisk har lagret (eller null).
export async function getOrgProfile(): Promise<OrgProfile> {
  const row = await prisma.orgProfile.upsert({
    where: { id: ORG_PROFILE_ID },
    create: { id: ORG_PROFILE_ID },
    update: {},
    select: { logoPath: true, posterHeading: true, posterBody: true },
  });
  return row;
}

// ── Invitasjonskode ──────────────────────────────────────────────────────────
// Hostet drift setter REQUIRE_INVITE=1 (control-plane), slik at nye brukere må oppgi
// en kode fra admin for å registrere seg. Selvhostet (LAN) lar flagget stå av og
// beholder friksjonsfri registrering.

/** Sann i hostet drift der ny-registrering skal kreve en invitasjonskode. */
export function isInviteRequired(): boolean {
  return process.env.REQUIRE_INVITE === "1";
}

/** 8 tegn fra en forvekslingsvennlig alfabet (uten 0/o/1/l/i). Enkel å lese høyt. */
export function generateInviteCode(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

/** Leser gjeldende kode (eller null om ikke satt). */
export async function getInviteCode(): Promise<string | null> {
  const row = await prisma.orgProfile.upsert({
    where: { id: ORG_PROFILE_ID },
    create: { id: ORG_PROFILE_ID },
    update: {},
    select: { inviteCode: true },
  });
  return row.inviteCode;
}

/** Setter en ny kode og returnerer den. Brukes av admin «Generer ny kode». */
export async function rotateInviteCode(): Promise<string> {
  const inviteCode = generateInviteCode();
  await prisma.orgProfile.upsert({
    where: { id: ORG_PROFILE_ID },
    create: { id: ORG_PROFILE_ID, inviteCode },
    update: { inviteCode },
  });
  return inviteCode;
}

/** Sammenligner en oppgitt kode mot den lagrede (trim + case-insensitivt). */
export async function inviteCodeMatches(candidate: string): Promise<boolean> {
  const current = await getInviteCode();
  if (!current) return false;
  return candidate.trim().toLowerCase() === current.trim().toLowerCase();
}
