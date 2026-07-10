import { prisma } from "@/lib/db";
import { logConsumption } from "@/lib/consumption";
import { PRESET_PREFIX } from "@/lib/avatars";

// Demo-modus (DEMO_MODE=1): den offentlige prøv-selv-instansen
// (demo.<domene>) der besøkende kan logge en ekte kopp uten registrering.
//
//  - Fiktive kolleger «lever» gjennom dagen (simulerte kopper, se tick()).
//  - Besøkende blir gjestebrukere (Gjest-xxxx) via /api/demo/guest.
//  - Hver natt nullstilles alt: gjester og forbruk slettes, kollegene får
//    ny, plausibel historikk (se nightlyReset()).
//
// All orkestrering startes fra src/instrumentation.ts — kun når DEMO_MODE=1.

export const DEMO_MODE = process.env.DEMO_MODE === "1";

/** Fast token for demo-brikken → QR-koden på markedssiden kan være statisk. */
export const DEMO_TAG_TOKEN = "demo";

const GUEST_PREFIX = "Gjest-";
const GUEST_DEPT_SLUG = "besokende";

// De fiktive kollegene. Gjenkjennes på kallenavn (ingen egen kolonne — settet
// er lukket og navnene reserveres av ensureDemoData ved oppstart).
const COLLEAGUES = [
  { nickname: "KoffeinKari", dept: "utvikling", avatar: "preset-07" },
  { nickname: "PixelPelle", dept: "utvikling", avatar: "preset-13" },
  { nickname: "TeTrine", dept: "regnskap", avatar: "preset-21" },
  { nickname: "EspressoEspen", dept: "regnskap", avatar: "preset-04" },
  { nickname: "MokkaMona", dept: "servicedesk", avatar: "preset-30" },
  { nickname: "LatteLars", dept: "servicedesk", avatar: "preset-17" },
];

const DEPARTMENTS = [
  { slug: "utvikling", name: "Utvikling", color: "#7c5cff" },
  { slug: "regnskap", name: "Regnskap", color: "#ffd34d" },
  { slug: "servicedesk", name: "Servicedesk", color: "#39d98a" },
  { slug: GUEST_DEPT_SLUG, name: "Besøkende", color: "#ff5c7c" },
];

/** Idempotent oppsett av demo-verdenen: avdelinger, kolleger, stasjon + brikke. */
export async function ensureDemoData(): Promise<void> {
  const deptBySlug: Record<string, number> = {};
  for (const d of DEPARTMENTS) {
    const row = await prisma.department.upsert({
      where: { slug: d.slug },
      update: { name: d.name, color: d.color },
      create: d,
    });
    deptBySlug[d.slug] = row.id;
  }

  for (const c of COLLEAGUES) {
    await prisma.user.upsert({
      where: { nickname: c.nickname },
      update: {},
      // pinHash null → kan ikke logges inn som; finnes kun på topplista.
      create: {
        nickname: c.nickname,
        departmentId: deptBySlug[c.dept],
        avatarPath: `${PRESET_PREFIX}${c.avatar}`,
      },
    });
  }

  const existingTag = await prisma.stationTag.findUnique({
    where: { token: DEMO_TAG_TOKEN },
  });
  if (!existingTag) {
    const station = await prisma.station.create({ data: { name: "Kaffemaskinen" } });
    await prisma.stationTag.create({
      data: { token: DEMO_TAG_TOKEN, stationId: station.id, label: "Demo-brikken" },
    });
  }
}

/** Vektet drikkevalg for simuleringen: mest kaffe, litt te, sjelden kakao. */
async function randomDrinkId(): Promise<number | null> {
  const keys = ["coffee", "coffee", "coffee", "coffee", "coffee", "coffee", "coffee", "tea", "tea", "cocoa"];
  const key = keys[Math.floor(Math.random() * keys.length)];
  const drink = await prisma.drink.findUnique({ where: { key } });
  return drink?.id ?? null;
}

/** Sannsynlighet for at én kollega logger i løpet av et tick, etter klokkeslett. */
function tickProbability(hour: number): number {
  if (hour >= 7 && hour < 10) return 0.35; // morgenrush
  if (hour >= 11 && hour < 13) return 0.25; // lunsj
  if (hour >= 13 && hour < 16) return 0.15; // ettermiddag
  if (hour >= 6 && hour < 20) return 0.06; // resten av arbeidsdagen
  return 0; // natt — kontoret sover
}

/** Ett simuleringssteg: la tilfeldige kolleger logge en kopp. Kalles hvert 5. min. */
export async function simulateTick(now = new Date()): Promise<void> {
  const p = tickProbability(now.getHours());
  if (p === 0) return;

  for (const c of COLLEAGUES) {
    if (Math.random() > p) continue;
    const user = await prisma.user.findUnique({ where: { nickname: c.nickname } });
    const drinkId = await randomDrinkId();
    if (!user || !drinkId) continue;
    // logConsumption gir kollegene ekte merker også — demoen viser hele loopen.
    await logConsumption({ userId: user.id, drinkId, source: "web" });
  }
}

/** Nattlig nullstilling: alt forbruk og alle gjester ut, frisk historikk inn. */
export async function nightlyReset(): Promise<void> {
  await prisma.consumption.deleteMany({});
  await prisma.userAchievement.deleteMany({});

  const guests = await prisma.user.findMany({
    where: { nickname: { startsWith: GUEST_PREFIX } },
    select: { id: true },
  });
  const guestIds = guests.map((g) => g.id);
  if (guestIds.length > 0) {
    await prisma.session.deleteMany({ where: { userId: { in: guestIds } } });
    await prisma.loginToken.deleteMany({ where: { userId: { in: guestIds } } });
    await prisma.user.deleteMany({ where: { id: { in: guestIds } } });
  }

  // Litt plausibel historikk siste uke, så topplister/statistikk aldri er tomme.
  for (const c of COLLEAGUES) {
    const user = await prisma.user.findUnique({ where: { nickname: c.nickname } });
    if (!user) continue;
    const cups = 8 + Math.floor(Math.random() * 18);
    for (let i = 0; i < cups; i++) {
      const drinkId = await randomDrinkId();
      if (!drinkId) continue;
      const daysAgo = Math.floor(Math.random() * 7);
      const hour = 7 + Math.floor(Math.random() * 9);
      const at = new Date();
      at.setDate(at.getDate() - daysAgo);
      at.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      if (at > new Date()) continue;
      await prisma.consumption.create({
        data: { userId: user.id, drinkId, source: "web", createdAt: at },
      });
    }
  }
}

/** Opprett en anonym gjestebruker (Gjest-xxxx) med tilfeldig pixel-avatar. */
export async function createGuestUser() {
  const dept = await prisma.department.findUnique({ where: { slug: GUEST_DEPT_SLUG } });
  if (!dept) throw new Error("Demo-data mangler — ensureDemoData har ikke kjørt");

  // Forvekslingsfritt alfabet (som orgProfile), 4 tegn holder for én dag.
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = Array.from(
      { length: 4 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join("");
    const avatar = `preset-${String(1 + Math.floor(Math.random() * 42)).padStart(2, "0")}`;
    try {
      return await prisma.user.create({
        data: {
          nickname: `${GUEST_PREFIX}${suffix}`,
          departmentId: dept.id,
          avatarPath: `${PRESET_PREFIX}${avatar}`,
        },
      });
    } catch {
      // kallenavn-kollisjon — prøv igjen med nytt suffiks
    }
  }
  throw new Error("Klarte ikke å opprette gjestebruker");
}
