"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";

// A5-«skann her»-plakat for én brikke. Lyst ark (skrivervennlig) med bedriftens logo,
// redigerbar overskrift/promotekst (overstyres lokalt før utskrift, ikke lagret), stor
// QR mot /t/<token> og brikke-info som fineprint. Kontroll-chrome skjules ved utskrift.
export function PosterClient({
  token,
  stationName,
  stationLocation,
  tagLabel,
  drinkName,
  appName,
  logoPath,
  heading,
  body,
}: {
  token: string;
  stationName: string;
  stationLocation: string | null;
  tagLabel: string | null;
  drinkName: string | null;
  appName: string;
  logoPath: string | null;
  // null → bruk lokalisert standardtekst (admin har ikke lagt inn egen).
  heading: string | null;
  body: string | null;
}) {
  const t = useTranslations("Poster");
  const [head, setHead] = useState(heading ?? t("defaultHeading"));
  const [promo, setPromo] = useState(body ?? t("defaultBody"));

  // Base-URL settes etter mount (samme logikk som TagQrModal) for å unngå
  // hydrerings-mismatch. Brikkene må peke på en adresse mobilene kan nå.
  const [tagBase, setTagBase] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTagBase(process.env.NEXT_PUBLIC_TAG_BASE_URL || window.location.origin);
  }, []);

  const url = `${tagBase}/t/${token}`;

  return (
    <div className="poster-screen min-h-screen flex flex-col items-center gap-4 py-6 px-4">
      {/* Verktøylinje – vises ikke på utskrift */}
      <div className="poster-toolbar flex gap-3 items-center flex-wrap justify-center">
        <button className="pixel-btn" onClick={() => window.print()}>
          {t("printButton")}
        </button>
        <span className="text-ink-dim text-sm">{t("editHint")}</span>
      </div>

      {/* Selve A5-arket */}
      <div className="poster-sheet" style={POSTER_SHEET_STYLE}>
        {logoPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/uploads/${logoPath}`}
            alt={t("logoAlt")}
            style={{ maxHeight: "26mm", maxWidth: "80%", objectFit: "contain", imageRendering: "auto" }}
          />
        ) : null}

        <input
          className="poster-edit"
          value={head}
          onChange={(e) => setHead(e.target.value)}
          style={{ fontSize: "26pt", fontWeight: 800, textAlign: "center" }}
          aria-label={t("headingLabel")}
        />

        {/* QR + skann-her */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3mm" }}>
          <div style={{ border: "3px solid #14112b", padding: "4mm", background: "#fff" }}>
            <QRCodeSVG
              value={url}
              level="M"
              marginSize={1}
              style={{ width: "55mm", height: "55mm", display: "block" }}
            />
          </div>
          <div style={{ fontSize: "16pt", fontWeight: 700, letterSpacing: "0.05em" }}>
            {t("scanHere")}
          </div>
          <div style={{ fontSize: "9pt", color: "#555", textAlign: "center" }}>
            {t("scanInstructions")}
          </div>
        </div>

        {/* Stasjon */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18pt", fontWeight: 700 }}>{stationName}</div>
          {stationLocation ? (
            <div style={{ fontSize: "10pt", color: "#555" }}>{stationLocation}</div>
          ) : null}
        </div>

        <textarea
          className="poster-edit"
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          rows={2}
          style={{ fontSize: "13pt", textAlign: "center", resize: "none", width: "100%" }}
          aria-label={t("bodyLabel")}
        />

        {/* Fineprint nederst */}
        <div style={POSTER_FOOTER_STYLE}>
          <div style={{ fontWeight: 700 }}>{appName}</div>
          <div>
            {drinkName ? `${t("logs", { drink: drinkName })} · ` : ""}
            {tagLabel ? `${tagLabel} · ` : ""}
            <span style={{ fontFamily: "monospace" }}>{token}</span>
          </div>
          <div style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{url}</div>
        </div>
      </div>
    </div>
  );
}

// A5 stående: 148 × 210 mm. Lyst ark med myk pixel-ramme, sentrert innhold.
const POSTER_SHEET_STYLE: React.CSSProperties = {
  width: "148mm",
  minHeight: "210mm",
  boxSizing: "border-box",
  padding: "12mm 10mm",
  background: "#ffffff",
  color: "#14112b",
  border: "4px solid #14112b",
  boxShadow: "8px 8px 0 0 rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "7mm",
  textAlign: "center",
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
};

const POSTER_FOOTER_STYLE: React.CSSProperties = {
  marginTop: "auto",
  paddingTop: "4mm",
  borderTop: "2px solid #ddd",
  width: "100%",
  fontSize: "8pt",
  color: "#555",
  display: "flex",
  flexDirection: "column",
  gap: "1mm",
};
