// Deler rutenett-bilder med flere avatarer opp i enkeltstående PNG-er.
//
// Kildebildene (to rutenett) er IKKE i repoet. Legg dem på disk og kjør:
//
//   npm i -D sharp
//   node scripts/slice-avatars.mjs <30-rutenett.png> <12-rutenett.png>
//
// Standard: forventer to filer i ./design-src/ hvis ingen argumenter gis.
// Resultat: public/avatars/preset/preset-01.png … preset-42.png
//
// Antall kolonner/rader per rutenett er konfigurert i GRIDS under. Juster der
// hvis kildebildene har en annen layout.

import path from "node:path";
import { mkdir, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

const sharp = (await import("sharp")).default;

const OUT_DIR = path.join(process.cwd(), "public", "avatars", "preset");
const CELL = 256; // utdata-størrelse per avatar (px)

const [arg1, arg2] = process.argv.slice(2);
const GRIDS = [
  { file: arg1 ?? "design-src/avatars-30.png", cols: 6, rows: 5 }, // 30 avatarer
  { file: arg2 ?? "design-src/avatars-12.png", cols: 4, rows: 3 }, // 12 avatarer
];

async function sliceGrid({ file, cols, rows }, startIndex) {
  const src = path.resolve(file);
  if (!existsSync(src)) {
    throw new Error(`Fant ikke kildebilde: ${src}`);
  }
  const img = sharp(src);
  const { width, height } = await img.metadata();
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / rows);
  console.log(`${file}: ${width}×${height} → ${cols}×${rows} celler à ${cellW}×${cellH}`);

  let index = startIndex;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const name = `preset-${String(index).padStart(2, "0")}.png`;
      await sharp(src)
        .extract({ left: c * cellW, top: r * cellH, width: cellW, height: cellH })
        .trim({ threshold: 12 }) // fjern ensfarget ramme rundt avataren
        .resize(CELL, CELL, { fit: "cover" })
        .png()
        .toFile(path.join(OUT_DIR, name));
      index++;
    }
  }
  return index;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  // tøm gamle utklipp så vi ikke blander gammelt og nytt
  for (const f of await readdir(OUT_DIR).catch(() => [])) {
    if (f.startsWith("preset-")) await rm(path.join(OUT_DIR, f));
  }

  let next = 1;
  for (const grid of GRIDS) {
    next = await sliceGrid(grid, next);
  }
  console.log(`Ferdig: ${next - 1} avatarer skrevet til ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
