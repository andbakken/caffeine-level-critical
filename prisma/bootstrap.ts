import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

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
  ];
  const drinkByKey: Record<string, number> = {};
  for (const d of drinks) {
    const row = await prisma.drink.upsert({ where: { key: d.key }, update: d, create: d });
    drinkByKey[d.key] = row.id;
  }

  // --- Merker (regelstyrt) ---
  const achievements = [
    { key: "first-sip", name: "Første slurk", description: "Logg din aller første kopp", icon: "🥤", ruleType: "total", threshold: 1, drinkId: null as number | null, sortOrder: 1 },
    { key: "ten-cups", name: "Tørst", description: "Logg 10 kopper totalt", icon: "☕", ruleType: "total", threshold: 10, drinkId: null, sortOrder: 2 },
    { key: "fifty-cups", name: "Koffeinmisbruker", description: "Logg 50 kopper totalt", icon: "⚡", ruleType: "total", threshold: 50, drinkId: null, sortOrder: 3 },
    { key: "hundred-cups", name: "Koppmester", description: "Logg 100 kopper totalt", icon: "👑", ruleType: "total", threshold: 100, drinkId: null, sortOrder: 4 },
    { key: "early-bird", name: "Morgenfugl", description: "Logg en kopp før kl. 08", icon: "🌅", ruleType: "before_hour", threshold: 8, drinkId: null, sortOrder: 5 },
    { key: "night-owl", name: "Nattugle", description: "Logg en kopp etter kl. 20", icon: "🦉", ruleType: "after_hour", threshold: 20, drinkId: null, sortOrder: 6 },
    { key: "variety", name: "Allsidig", description: "Prøv 3 ulike drikketyper", icon: "🌈", ruleType: "distinct", threshold: 3, drinkId: null, sortOrder: 7 },
    { key: "coffee-addict", name: "Kaffeholiker", description: "Logg 25 kaffe", icon: "🤎", ruleType: "drink", threshold: 25, drinkId: drinkByKey.coffee, sortOrder: 8 },
  ];
  for (const a of achievements) {
    await prisma.achievement.upsert({ where: { key: a.key }, update: a, create: a });
  }

  // --- Admin-bruker fra miljøvariabler ---
  const nickname = (process.env.ADMIN_NICKNAME ?? "GameMaster").trim();
  const pin = (process.env.ADMIN_PIN ?? "1234").trim();
  const existing = await prisma.user.findUnique({ where: { nickname } });
  if (!existing) {
    await prisma.user.create({
      data: { nickname, pinHash: bcrypt.hashSync(pin, 10), departmentId: dept.id, isAdmin: true },
    });
    console.log(`Opprettet admin-bruker «${nickname}».`);
  } else {
    console.log(`Admin-bruker «${nickname}» finnes allerede — hopper over.`);
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
