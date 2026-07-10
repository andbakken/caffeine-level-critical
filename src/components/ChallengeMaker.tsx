"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cleanName } from "@/lib/challenge";

declare global {
  interface Window {
    umami?: { track: (event: string) => void };
  }
}

// Lag en delbar kaffe-utfordring: to navn → lenke med eget OG-kort
// («Regnskap utfordrer Utvikling ☕⚔️»). Ingen lagring — alt bor i URL-en.
export function ChallengeMaker({ initialFrom, initialTo }: { initialFrom: string; initialTo: string }) {
  const t = useTranslations("Challenge");
  const locale = useLocale();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [shared, setShared] = useState(false);

  const fromClean = cleanName(from) || t("defaultFrom");
  const toClean = cleanName(to) || t("defaultTo");

  function shareUrl() {
    const base = `${location.origin}${locale === "en" ? "/en" : ""}/utfordring`;
    return `${base}?${new URLSearchParams({ fra: fromClean, til: toClean })}`;
  }

  async function share() {
    const url = shareUrl();
    history.replaceState(null, "", url);
    window.umami?.track("challenge_share");
    try {
      if (navigator.share) {
        await navigator.share({ title: t("shareTitle"), text: t("shareText", { from: fromClean, to: toClean }), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
    } catch {
      /* avbrutt deling er greit */
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="pixel-panel p-6 grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-ink-dim text-base">{t("fromLabel")}</span>
          <input
            className="pixel-input"
            value={from}
            maxLength={24}
            placeholder={t("defaultFrom")}
            onChange={(e) => {
              setShared(false);
              setFrom(e.target.value);
            }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink-dim text-base">{t("toLabel")}</span>
          <input
            className="pixel-input"
            value={to}
            maxLength={24}
            placeholder={t("defaultTo")}
            onChange={(e) => {
              setShared(false);
              setTo(e.target.value);
            }}
          />
        </label>
      </div>

      {/* Forhåndsvisning av kortet */}
      <div className="pixel-panel p-8 flex flex-col items-center gap-3 text-center" style={{ borderColor: "var(--color-gold)" }}>
        <p className="text-4xl" aria-hidden>
          ☕⚔️☕
        </p>
        <p className="heading text-gold text-lg sm:text-xl leading-relaxed">
          {t("card", { from: fromClean, to: toClean })}
        </p>
        <p className="text-ink-dim text-base leading-relaxed max-w-md">{t("cardSub")}</p>
        <button type="button" className="pixel-btn pixel-btn-gold mt-2" onClick={share}>
          {shared ? t("copied") : t("shareButton")}
        </button>
      </div>
    </div>
  );
}
