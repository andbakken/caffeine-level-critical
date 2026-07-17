import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { DEFAULT_ACHIEVEMENTS } from "../src/content/achievements";

// Produksjons-oppstart: idempotent. Kjøres ved hver container-start.
// Sikrer standarddrikker, standardmerker og én admin-bruker fra miljøvariabler.
// I motsetning til seed.ts lager den INGEN demo-brukere eller demo-forbruk.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Standard avdeling for admin ---
  const dept = await prisma.department.upsert({
    where: { slug: "generelt" },
    update: {},
    create: { slug: "generelt", name: "Generelt", color: "#7c5cff" },
  });

  // --- Drikker ---
  const drinks = [
    { key: "coffee", displayName: "Kaffe", icon: "☕", color: "#6f4e37", sortOrder: 1 },
    { key: "tea", displayName: "Te", icon: "🍵", color: "#4e9a51", sortOrder: 2 },
    { key: "cocoa", displayName: "Kakao", icon: "🍫", color: "#8b5a2b", sortOrder: 3 },
    { key: "water_bottle", displayName: "Flaske vann", icon: "💧", color: "#7fb3d5", sortOrder: 4 },
    { key: "water_glass", displayName: "Glass vann", icon: "🥛", color: "#aed6f1", sortOrder: 5 },
  ];
  const drinkByKey: Record<string, number> = {};
  for (const d of drinks) {
    const row = await prisma.drink.upsert({ where: { key: d.key }, update: d, create: d });
    drinkByKey[d.key] = row.id;
  }

  // --- Merker (regelstyrt) ---
  // Definisjonene bor i src/content/achievements.ts (delt med markedssidens
  // /merker-galleri). drinkKey mappes til DB-id her.
  for (const a of DEFAULT_ACHIEVEMENTS) {
    const { drinkKey, ...rest } = a;
    const row = { ...rest, drinkId: drinkKey ? (drinkByKey[drinkKey] ?? null) : null };
    await prisma.achievement.upsert({ where: { key: a.key }, update: row, create: row });
  }

  // --- Admin-bruker fra miljøvariabler ---
  // Hostet: ADMIN_EMAIL settes → admin logger inn med magic-link (PIN valgfri).
  // Selvhostet: kun ADMIN_NICKNAME/ADMIN_PIN → PIN-innlogging som før.
  const nickname = (process.env.ADMIN_NICKNAME ?? "GameMaster").trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
  const pinRaw = process.env.ADMIN_PIN?.trim();
  const pinHash = pinRaw ? bcrypt.hashSync(pinRaw, 10) : null;

  // Finn eksisterende admin på e-post (hostet) eller kallenavn (selvhostet).
  const existing = email
    ? await prisma.user.findFirst({ where: { OR: [{ email }, { nickname }] } })
    : await prisma.user.findUnique({ where: { nickname } });

  if (!existing) {
    await prisma.user.create({
      data: { nickname, email, pinHash, departmentId: dept.id, isAdmin: true },
    });
    console.log(`Opprettet admin-bruker «${nickname}»${email ? ` (${email})` : ""}.`);
  } else {
    console.log(`Admin-bruker finnes allerede — hopper over.`);
  }

  // --- Hostet: fjern PIN fra admins som har e-post ---
  // På tenant logger e-post-admin inn med magic-link. En PIN i tillegg er netto
  // svekkelse: kallenavnet er forutsigbart («GameMaster»), instansen ligger åpent
  // på internett, og noen få sifre erstatter da en engangslenke til e-post.
  // API-et nekter å sette en slik PIN (src/app/api/me/route.ts), men kontoer som
  // fikk en FØR den regelen fantes, ville ellers beholdt den. Trygt å fjerne:
  // brukeren har e-post og kommer alltid inn via magic-link.
  if (process.env.IS_TENANT === "1") {
    const cleared = await prisma.user.updateMany({
      where: { isAdmin: true, email: { not: null }, pinHash: { not: null } },
      data: { pinHash: null },
    });
    if (cleared.count > 0) {
      console.log(
        `Fjernet PIN fra ${cleared.count} e-post-admin(er) — de logger inn via innloggingslenke.`,
      );
    }
  }

  // --- Invitasjonskode (kun hostet: REQUIRE_INVITE=1) ---
  // Generer én kode ved første oppstart hvis den mangler. Overskriv aldri en
  // eksisterende kode (admin kan ha rotert den bevisst). Samme forvekslingsvennlige
  // alfabet som src/lib/orgProfile.ts (uten 0/o/1/l/i).
  if (process.env.REQUIRE_INVITE === "1") {
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
    const bytes = randomBytes(8);
    const inviteCode = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");

    const profile = await prisma.orgProfile.upsert({
      where: { id: 1 },
      create: { id: 1, inviteCode },
      update: {},
      select: { inviteCode: true },
    });
    if (!profile.inviteCode) {
      await prisma.orgProfile.update({ where: { id: 1 }, data: { inviteCode } });
      console.log(`Genererte invitasjonskode: ${inviteCode}`);
    } else {
      console.log("Invitasjonskode finnes allerede — hopper over.");
    }
  }

  console.log("Bootstrap ferdig ✔");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
