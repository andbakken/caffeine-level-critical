import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/brand";
import { cleanName } from "@/lib/challenge";

// Delingskort for kaffe-utfordringen (?fra=&til=&locale=). Navnene renses
// hardt i cleanName siden hvem som helst kan lage lenker.

export const runtime = "edge";

const TEXTS: Record<string, { challenges: string; sub: string; cta: string }> = {
  no: {
    challenges: "utfordrer",
    sub: "Hvem drikker mest kaffe? Toppliste, merker og NFC-brikker ved maskinen.",
    cta: "Ta imot utfordringen →",
  },
  en: {
    challenges: "challenges",
    sub: "Who drinks the most coffee? Leaderboard, badges and NFC tags by the machine.",
    cta: "Accept the challenge →",
  },
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = cleanName(url.searchParams.get("fra")) || "Kontor A";
  const to = cleanName(url.searchParams.get("til")) || "Kontor B";
  const t = TEXTS[url.searchParams.get("locale") ?? "no"] ?? TEXTS.no;

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
          gap: 36,
          background: "#0d0b1a",
          border: "16px solid #ffd34d",
          padding: 70,
        }}
      >
        <div style={{ display: "flex", fontSize: 76 }}>☕⚔️☕</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, color: "#ffd34d", textAlign: "center" }}>
            {from}
          </div>
          <div style={{ display: "flex", fontSize: 40, color: "#39d98a", textTransform: "uppercase", letterSpacing: 4 }}>
            {t.challenges}
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, color: "#7c5cff", textAlign: "center" }}>
            {to}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#b3abdf", textAlign: "center" }}>
          {t.sub}
        </div>
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#0d0b1a", background: "#ffd34d", padding: "10px 26px" }}>
          ☕ {APP_NAME} · {t.cta}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
