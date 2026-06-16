import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Departments (lag innad i en IT-avdeling) ---
  const departments = [
    { slug: "drift", name: "Drift & Infra", color: "#39d98a" },
    { slug: "utvikling", name: "Utvikling", color: "#7c5cff" },
    { slug: "servicedesk", name: "Servicedesk", color: "#ffb340" },
    { slug: "sikkerhet", name: "Sikkerhet", color: "#ff5c7c" },
  ];
  const deptBySlug: Record<string, number> = {};
  for (const d of departments) {
    const row = await prisma.department.upsert({
      where: { slug: d.slug },
      update: { name: d.name, color: d.color },
      create: d,
    });
    deptBySlug[d.slug] = row.id;
  }

  // --- Drinks ---
  const drinks = [
    { key: "coffee", displayName: "Kaffe", icon: "☕", color: "#6f4e37", sortOrder: 1 },
    { key: "tea", displayName: "Te", icon: "🍵", color: "#4e9a51", sortOrder: 2 },
    { key: "cocoa", displayName: "Kakao", icon: "🍫", color: "#8b5a2b", sortOrder: 3 },
    { key: "water_bottle", displayName: "Flaske vann", icon: "💧", color: "#7fb3d5", sortOrder: 4 },
    { key: "water_glass", displayName: "Glass vann", icon: "🥛", color: "#aed6f1", sortOrder: 5 },
  ];
  const drinkByKey: Record<string, number> = {};
  for (const d of drinks) {
    const row = await prisma.drink.upsert({
      where: { key: d.key },
      update: { displayName: d.displayName, icon: d.icon, color: d.color, sortOrder: d.sortOrder },
      create: d,
    });
    drinkByKey[d.key] = row.id;
  }

  // --- Stations ---
  const mainKitchen = await prisma.station.upsert({
    where: { id: 1 },
    update: { name: "Hovedkjøkken", location: "3. etasje" },
    create: { name: "Hovedkjøkken", location: "3. etasje", color: "#39d98a" },
  });
  const lounge = await prisma.station.upsert({
    where: { id: 2 },
    update: { name: "Lounge", location: "Kantine" },
    create: { name: "Lounge", location: "Kantine", color: "#7c5cff" },
  });

  // --- Station tags (demo tokens; admin lager tilfeldige i drift) ---
  const tags = [
    { token: "kjokken", label: "Kjøkken – velg selv", stationId: mainKitchen.id, drinkId: null as number | null },
    { token: "kjokken-kaffe", label: "Kjøkken – Kaffe", stationId: mainKitchen.id, drinkId: drinkByKey.coffee },
    { token: "kjokken-te", label: "Kjøkken – Te", stationId: mainKitchen.id, drinkId: drinkByKey.tea },
    { token: "kjokken-kakao", label: "Kjøkken – Kakao", stationId: mainKitchen.id, drinkId: drinkByKey.cocoa },
    { token: "lounge", label: "Lounge – velg selv", stationId: lounge.id, drinkId: null },
  ];
  for (const t of tags) {
    await prisma.stationTag.upsert({
      where: { token: t.token },
      update: { label: t.label, stationId: t.stationId, drinkId: t.drinkId },
      create: t,
    });
  }

  // --- Achievements (badges) ---
  // ruleType: total | distinct | drink | before_hour | after_hour | drink_each | streak | day_total | weekend
  const achievements = [
    { key: "first-sip", name: "Første slurk", description: "Logg din aller første kopp", icon: "🥤", ruleType: "total", threshold: 1, drinkId: null as number | null, sortOrder: 1 },
    { key: "ten-cups", name: "Tørst", description: "Logg 10 kopper totalt", icon: "☕", ruleType: "total", threshold: 10, drinkId: null, sortOrder: 2 },
    { key: "fifty-cups", name: "Koffeinmisbruker", description: "Logg 50 kopper totalt", icon: "⚡", ruleType: "total", threshold: 50, drinkId: null, sortOrder: 3 },
    { key: "hundred-cups", name: "Koppmester", description: "Logg 100 kopper totalt", icon: "👑", ruleType: "total", threshold: 100, drinkId: null, sortOrder: 4 },
    { key: "early-bird", name: "Morgenfugl", description: "Logg en kopp før kl. 08", icon: "🌅", ruleType: "before_hour", threshold: 8, drinkId: null, sortOrder: 5 },
    { key: "night-owl", name: "Nattugle", description: "Logg en kopp etter kl. 20", icon: "🦉", ruleType: "after_hour", threshold: 20, drinkId: null, sortOrder: 6 },
    { key: "variety", name: "Allsidig", description: "Prøv 3 ulike drikketyper", icon: "🌈", ruleType: "distinct", threshold: 3, drinkId: null, sortOrder: 7 },
    { key: "coffee-addict", name: "Kaffeholiker", description: "Logg 25 kaffe", icon: "🤎", ruleType: "drink", threshold: 25, drinkId: drinkByKey.coffee, sortOrder: 8 },
    { key: "full-collection", name: "Komplett samling", description: "Logg minst 10 av hver drikke", icon: "🎯", ruleType: "drink_each", threshold: 10, drinkId: null, sortOrder: 9 },
    { key: "streak-5", name: "Trofast", description: "Logg minst én kopp 5 dager på rad", icon: "🔥", ruleType: "streak", threshold: 5, drinkId: null, sortOrder: 10 },
    { key: "marathon", name: "Maraton", description: "Logg 5 kopper på samme dag", icon: "🏃", ruleType: "day_total", threshold: 5, drinkId: null, sortOrder: 11 },
    { key: "weekend-warrior", name: "Helgekriger", description: "Logg en kopp i helgen", icon: "🎉", ruleType: "weekend", threshold: 1, drinkId: null, sortOrder: 12 },
  ];
  for (const a of achievements) {
    await prisma.achievement.upsert({ where: { key: a.key }, update: a, create: a });
  }

  // --- Demo users ---
  const users = [
    { nickname: "GameMaster", pin: "1234", dept: "drift", isAdmin: true },
    { nickname: "PixelPelle", pin: "1111", dept: "utvikling", isAdmin: false },
    { nickname: "KoffeinKari", pin: "2222", dept: "drift", isAdmin: false },
    { nickname: "TeTrine", pin: "3333", dept: "servicedesk", isAdmin: false },
    { nickname: "KakaoKnut", pin: "4444", dept: "sikkerhet", isAdmin: false },
  ];
  const userByNick: Record<string, number> = {};
  for (const u of users) {
    const pinHash = bcrypt.hashSync(u.pin, 10);
    const row = await prisma.user.upsert({
      where: { nickname: u.nickname },
      update: { departmentId: deptBySlug[u.dept], isAdmin: u.isAdmin },
      create: { nickname: u.nickname, pinHash, departmentId: deptBySlug[u.dept], isAdmin: u.isAdmin },
    });
    userByNick[u.nickname] = row.id;
  }

  // --- Demo consumptions (kun hvis tom, for å fylle dashboardet) ---
  const existing = await prisma.consumption.count();
  if (existing === 0) {
    const drinkIds = Object.values(drinkByKey);
    const userIds = Object.values(userByNick);
    const now = Date.now();
    const rows: { userId: number; drinkId: number; source: string; stationId: number; createdAt: Date }[] = [];
    for (let day = 0; day < 7; day++) {
      for (const userId of userIds) {
        const cups = 1 + Math.floor(Math.random() * 5);
        for (let c = 0; c < cups; c++) {
          const hour = 7 + Math.floor(Math.random() * 12);
          const created = new Date(now - day * 86400000);
          created.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
          rows.push({
            userId,
            drinkId: drinkIds[Math.floor(Math.random() * drinkIds.length)],
            source: Math.random() > 0.5 ? "tag" : "web",
            stationId: Math.random() > 0.5 ? mainKitchen.id : lounge.id,
            createdAt: created,
          });
        }
      }
    }
    await prisma.consumption.createMany({ data: rows });
    console.log(`Seeded ${rows.length} demo consumptions`);
  }

  console.log("Seed complete ✔");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
