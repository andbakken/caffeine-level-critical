// Tar produkt-skjermbildene som vises på markedssidene (public/screenshots/).
//
// Krever en kjørende dev-instans med seed-data (prisma/seed.ts) og en Chromium:
//
//   DATABASE_URL=… npm run db:deploy && npm run db:seed
//   DATABASE_URL=… npm run dev -- -p 3100
//   npm i -D playwright-core            # og en Chromium på disk
//   BASE=http://localhost:3100 CHROMIUM=/sti/til/chromium node scripts/marketing-screenshots.mjs
//
// Skriptet logger inn som seed-brukeren KoffeinKari, logger noen kopper så
// achievements låses opp, og tar tre bilder: dashboard + toppliste (desktop,
// 2x) og profil/merker (mobil, 2x). Resultatet legges i public/screenshots/.

import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3100";
const OUT = path.join(process.cwd(), "public", "screenshots");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
});

// Skjul Next.js dev-indikatoren («N»-badgen) før hvert skudd.
async function hideDevBadge(page) {
  await page.addStyleTag({ content: "nextjs-portal{display:none !important}" });
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  // Vent på React-hydrering så onSubmit faktisk er koblet på (dev-modus er treg).
  await page.waitForTimeout(4000);
  await page.locator('input[autocomplete="username"]').fill("KoffeinKari");
  await page.locator('input[type="password"]').fill("2222");
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/auth/login"), { timeout: 30000 }),
    page.locator('form button.pixel-btn:not([type="button"])').first().click(),
  ]);
  if (!res.ok()) throw new Error(`login failed: ${res.status()}`);
  await page.waitForURL("**/dashboard**", { timeout: 30000 });
}

// Desktop-utsnitt: dashboard + toppliste
const desktop = await browser.newContext({
  viewport: { width: 1100, height: 800 },
  locale: "nb-NO",
  deviceScaleFactor: 2,
});
const page = await desktop.newPage();
await login(page);
await page.waitForTimeout(2500);

// Logg noen kopper så achievements faktisk låses opp (seedes ikke).
for (let i = 0; i < 6; i++) {
  await page.locator("button", { hasText: "Kaffe" }).first().click();
  await page.waitForTimeout(1200);
  await page.keyboard.press("Escape"); // lukk eventuell feirings-modal
  await page.waitForTimeout(300);
}
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await hideDevBadge(page);
await page.screenshot({ path: path.join(OUT, "dashboard.png") });

await page.goto(`${BASE}/leaderboard`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await hideDevBadge(page);
await page.screenshot({ path: path.join(OUT, "leaderboard.png") });

// Mobil-utsnitt: min side med profilkort og merker
const mobile = await browser.newContext({
  viewport: { width: 420, height: 860 },
  locale: "nb-NO",
  deviceScaleFactor: 2,
});
const mp = await mobile.newPage();
await login(mp);
await mp.goto(`${BASE}/me`, { waitUntil: "networkidle" });
await mp.waitForTimeout(2500);
await hideDevBadge(mp);
await mp.screenshot({ path: path.join(OUT, "merker.png") });

await browser.close();
console.log(`Skjermbilder lagret i ${OUT}`);
