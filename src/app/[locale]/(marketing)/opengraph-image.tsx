import { ImageResponse } from "next/og";
import { APP_NAME, APP_NAME_FULL, APP_SUBTITLE } from "@/lib/brand";

export const alt = APP_NAME_FULL;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const tagline: Record<string, string> = {
  no: "Gjør kaffepausen til en konkurranse",
  en: "Turn the coffee break into a competition",
};

// Delingsbilde i samme mørke pixel-palett som appen (se globals.css).
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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
          gap: 40,
          background: "#0d0b1a",
          border: "16px solid #3a3266",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 800,
              color: "#ffd34d",
              textAlign: "center",
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            {APP_NAME}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 44,
              fontWeight: 700,
              color: "#39d98a",
              textAlign: "center",
              letterSpacing: 2,
            }}
          >
            {APP_SUBTITLE}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "#9a92c9",
            textAlign: "center",
          }}
        >
          {tagline[locale] ?? tagline.no}
        </div>
        <div style={{ display: "flex", gap: 28, marginTop: 16 }}>
          <span style={{ display: "flex", width: 44, height: 44, background: "#b07a4b" }} />
          <span style={{ display: "flex", width: 44, height: 44, background: "#4e9a51" }} />
          <span style={{ display: "flex", width: 44, height: 44, background: "#8b5a2b" }} />
        </div>
      </div>
    ),
    size,
  );
}
