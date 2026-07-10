"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { calculate, clampInput, LEVELS, type CalcInput, type LevelKey } from "@/lib/caffeine";

declare global {
  interface Window {
    umami?: { track: (event: string) => void };
  }
}

const LEVEL_COLOR: Record<LevelKey, string> = {
  low: "var(--color-accent-2)",
  moderate: "var(--color-gold)",
  high: "#ff9f40",
  critical: "var(--color-danger)",
};

// Klientdelen av koffeinkalkulatoren: regner lokalt, oppdaterer URL-en
// (?k=&c=&t=&kk=) så resultatet kan deles, og deler via Web Share API der
// den finnes (ellers kopieres lenken).
export function CaffeineCalculator({ initial }: { initial: CalcInput }) {
  const t = useTranslations("Calculator");
  const locale = useLocale();
  const [input, setInput] = useState<CalcInput>(initial);
  const [shared, setShared] = useState(false);
  const result = useMemo(() => calculate(input), [input]);

  const levelIndex = LEVELS.findIndex((l) => l.key === result.level);

  function set(field: keyof CalcInput, value: string) {
    setShared(false);
    setInput((prev) => clampInput({ ...prev, [field]: value === "" ? 0 : Number(value) }));
  }

  function shareUrl() {
    const base = `${location.origin}${locale === "en" ? "/en" : ""}/koffein-kalkulator`;
    const q = new URLSearchParams({
      k: String(input.people),
      c: String(input.coffee),
      t: String(input.tea),
      kk: String(input.cocoa),
    });
    return `${base}?${q}`;
  }

  async function share() {
    const url = shareUrl();
    // Legg resultatet i adressefeltet også, så «kopier lenka» manuelt funker.
    history.replaceState(null, "", url);
    window.umami?.track("calculator_share");
    try {
      if (navigator.share) {
        await navigator.share({ title: t("shareTitle"), text: t("shareText", { total: result.total.toLocaleString("nb-NO") }), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
    } catch {
      /* avbrutt deling er helt greit */
    }
  }

  const fields: { key: keyof CalcInput; label: string }[] = [
    { key: "people", label: t("people") },
    { key: "coffee", label: t("coffee") },
    { key: "tea", label: t("tea") },
    { key: "cocoa", label: t("cocoa") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="pixel-panel p-6 grid sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="text-ink-dim text-base">{f.label}</span>
            <input
              className="pixel-input"
              type="number"
              min={f.key === "people" ? 1 : 0}
              max={f.key === "people" ? 5000 : 50}
              value={input[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
            />
          </label>
        ))}
      </div>

      {/* Resultat */}
      <div
        className="pixel-panel p-6 flex flex-col items-center gap-4 text-center"
        style={{ borderColor: LEVEL_COLOR[result.level] }}
        aria-live="polite"
      >
        <p className="font-display text-xs text-ink-dim uppercase tracking-widest">
          {t("resultLabel")}
        </p>
        <p className="font-display text-4xl sm:text-5xl" style={{ color: LEVEL_COLOR[result.level] }}>
          {result.total.toLocaleString("nb-NO")} mg
        </p>

        {/* Nivåmåler i fire pikselsteg */}
        <div className="flex gap-1 w-full max-w-xs" aria-hidden>
          {LEVELS.map((l, i) => (
            <span
              key={l.key}
              className="h-3 flex-1 border-2 border-line"
              style={{ background: i <= levelIndex ? LEVEL_COLOR[result.level] : "transparent" }}
            />
          ))}
        </div>
        <p className="heading text-base" style={{ color: LEVEL_COLOR[result.level] }}>
          {t("levelLabel")}: {t(`levels.${result.level}`)}
        </p>

        <p className="text-ink-dim text-base leading-relaxed max-w-md">
          {t("equivalents", {
            redBulls: result.redBulls.toLocaleString("nb-NO"),
            espresso: result.espresso.toLocaleString("nb-NO"),
          })}
        </p>
        {result.level === "critical" && (
          <p className="text-danger text-sm leading-relaxed max-w-md">⚠ {t("criticalNote")}</p>
        )}

        <button type="button" className="pixel-btn pixel-btn-gold" onClick={share}>
          {shared ? t("copied") : t("shareButton")}
        </button>
      </div>
    </div>
  );
}
