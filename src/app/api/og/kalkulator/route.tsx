import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/brand";
import { LEVELS, type LevelKey } from "@/lib/caffeine";

// Delingskort for koffeinkalkulatoren (?total=&level=&locale=). Samme mørke
// pixel-palett som resten av markedssidene (se globals.css / opengraph-image).

export const runtime = "edge";

const LEVEL_COLOR: Record<LevelKey, string> = {
  low: "#39d98a",
  moderate: "#ffd34d",
  high: "#ff9f40",
  critical: "#ff5c7c",
};

const TEXTS: Record<string, { headline: string; levels: Record<LevelKey, string>; cta: string }> = {
  no: {
    headline: "Kontoret vårt har koffein i blodet:",
    levels: { low: "NIVÅ: LAVT", moderate: "NIVÅ: MODERAT", high: "NIVÅ: HØYT", critical: "KOFFEINNIVÅ: KRITISK!" },
    cta: "Regn ut ditt kontor → koffein-kalkulatoren",
  },
  en: {
    headline: "Our office is running on:",
    levels: { low: "LEVEL: LOW", moderate: "LEVEL: MODERATE", high: "LEVEL: HIGH", critical: "CAFFEINE LEVEL: CRITICAL!" },
    cta: "Calculate your office → the caffeine calculator",
  },
};

function parseLevel(raw: string | null): LevelKey {
  return (LEVELS.find((l) => l.key === raw)?.key ?? "moderate") as LevelKey;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const total = Math.min(Math.max(Number(url.searchParams.get("total")) || 0, 0), 99_999_999);
  const level = parseLevel(url.searchParams.get("level"));
  const t = TEXTS[url.searchParams.get("locale") ?? "no"] ?? TEXTS.no;
  const color = LEVEL_COLOR[level];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
          background: "#0d0b1a",
          border: `16px solid ${color}`,
          padding: 70,
        }}
      >
        <div style={{ display: "flex", fontSize: 40, color: "#b3abdf" }}>{t.headline}</div>
        <div style={{ display: "flex", fontSize: 130, fontWeight: 800, color }}>
          {total.toLocaleString("nb-NO")} mg
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 800,
            color: "#0d0b1a",
            background: color,
            padding: "10px 30px",
          }}
        >
          {t.levels[level]}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#b3abdf", marginTop: 12 }}>
          ☕ {APP_NAME} · {t.cta}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
