"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";

// A5-«skann her»-plakat for én brikke. Mørkt, branded ark (matcher app-pixelstilen)
// med bedriftens logo, redigerbar overskrift/promotekst (overstyres lokalt før utskrift,
// lagres ikke), stor QR mot /t/<token>, en kort produkt-reklame og brikke-info i bunn.
// QR-en står på hvit bakgrunn så den kan skannes. Kontroll-chrome skjules ved utskrift.
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
        {/* Bedriftens logo – på hvit brikke så fargede logoer leses mot mørk bakgrunn */}
        {logoPath ? (
          <div style={LOGO_CHIP_STYLE}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/uploads/${logoPath}`}
              alt={t("logoAlt")}
              style={{ maxHeight: "11mm", maxWidth: "60mm", objectFit: "contain", imageRendering: "auto" }}
            />
          </div>
        ) : null}

        <input
          className="poster-edit"
          value={head}
          onChange={(e) => setHead(e.target.value)}
          style={{ fontSize: "23pt", fontWeight: 800, textAlign: "center", color: "#ffd34d" }}
          aria-label={t("headingLabel")}
        />

        {/* QR + skann-her */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3mm" }}>
          <div style={{ border: "4px solid #ffd34d", padding: "3mm", background: "#fff" }}>
            <QRCodeSVG
              value={url}
              level="M"
              marginSize={1}
              style={{ width: "40mm", height: "40mm", display: "block" }}
            />
          </div>
          <div style={{ fontSize: "18pt", fontWeight: 800, letterSpacing: "0.06em", color: "#ffd34d" }}>
            {t("scanHere")}
          </div>
          <div style={{ fontSize: "11pt", color: "#cfc9f0", textAlign: "center", maxWidth: "128mm" }}>
            {t("scanInstructions")}
          </div>
        </div>

        {/* Stasjon */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "20pt", fontWeight: 800, color: "#39d98a" }}>{stationName}</div>
          {stationLocation ? (
            <div style={{ fontSize: "11pt", color: "#9a92c9" }}>{stationLocation}</div>
          ) : null}
        </div>

        <textarea
          className="poster-edit"
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          rows={2}
          style={{ fontSize: "14pt", textAlign: "center", resize: "none", width: "100%", color: "#e8e6ff" }}
          aria-label={t("bodyLabel")}
        />

        {/* Produkt-reklame: korte value props */}
        <div style={FEATURES_STYLE}>
          <Feature icon="☕" text={t("feature1")} />
          <Feature icon="🎖️" text={t("feature2")} />
          <Feature icon="🏆" text={t("feature3")} />
        </div>

        {/* Footer: produktet (reklame for løsningen) + brikke-info */}
        <div style={POSTER_FOOTER_STYLE}>
          <div style={{ fontSize: "13pt", fontWeight: 800, color: "#ffd34d" }}>{appName}</div>
          <div style={{ fontSize: "10pt", color: "#cfc9f0" }}>{t("tagline")}</div>
          <div style={{ fontSize: "8.5pt", color: "#7d76ad", marginTop: "1mm" }}>
            {drinkName ? `${t("logs", { drink: drinkName })} · ` : ""}
            {tagLabel ? `${tagLabel} · ` : ""}
            <span style={{ fontFamily: "monospace" }}>{token}</span>
          </div>
          <div style={{ fontSize: "8.5pt", color: "#7d76ad", fontFamily: "monospace", wordBreak: "break-all" }}>
            {url}
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3mm", fontSize: "11pt" }}>
      <span style={{ fontSize: "14pt" }}>{icon}</span>
      <span style={{ color: "#e8e6ff", fontWeight: 600 }}>{text}</span>
    </div>
  );
}

// A5 stående: 148 × 210 mm. Mørkt branded ark med pixel-aktig glød og myk ramme.
const POSTER_SHEET_STYLE: React.CSSProperties = {
  width: "148mm",
  // Fast A5-høyde: innholdet er målt til ~206mm < 210, og overflow:hidden hindrer at
  // sub-millimeter-avrunding noensinne tipper plakaten over på en andre A5-side.
  height: "210mm",
  overflow: "hidden",
  boxSizing: "border-box",
  padding: "7mm 9mm",
  background:
    "radial-gradient(circle at 18% 0%, rgba(124,92,255,0.30), transparent 45%)," +
    "radial-gradient(circle at 100% 100%, rgba(57,217,138,0.20), transparent 45%)," +
    "#0d0b1a",
  color: "#e8e6ff",
  border: "4px solid #3a3266",
  boxShadow: "8px 8px 0 0 rgba(0,0,0,0.45)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2.5mm",
  textAlign: "center",
  // Deterministisk linjehøyde: ellers arver plakaten body sin 1.4 og blir høyere enn
  // den A5-passformen er målt mot (~206mm med 1.2). VT323 er smalere enn Courier New
  // (mål-fonten i passform-testen), så reell høyde ligger under dette.
  lineHeight: 1.2,
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
};

const LOGO_CHIP_STYLE: React.CSSProperties = {
  background: "#fff",
  borderRadius: "2mm",
  padding: "2.5mm 4mm",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const FEATURES_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.4mm",
  alignItems: "flex-start",
  background: "rgba(31,27,58,0.7)",
  border: "3px solid #7c5cff",
  borderRadius: "2mm",
  padding: "3mm 5mm",
};

const POSTER_FOOTER_STYLE: React.CSSProperties = {
  marginTop: "auto",
  paddingTop: "3mm",
  borderTop: "2px solid #3a3266",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "0.8mm",
};
