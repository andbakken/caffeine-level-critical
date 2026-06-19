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
