"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// Apex har ingen egen kundeinnlogging – hver bedrift bor på sitt eget subdomene
// (slug.<domene>). Denne lille «finn arbeidsområdet ditt»-formen sender brukeren
// til riktig subdomene-innlogging. Domenet leses fra window.location ved kjøretid
// (ikke build-time env), så den følger domenet appen faktisk kjører på.
export function WorkspaceFinder() {
  const t = useTranslations("Workspace");
  const [slug, setSlug] = useState("");
  const [host, setHost] = useState("");

  useEffect(() => {
    setHost(window.location.host.replace(/^www\./, ""));
  }, []);

  // Kun gyldige subdomene-tegn: små bokstaver, tall og bindestrek.
  const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!clean || !host) return;
    window.location.href = `${window.location.protocol}//${clean}.${host}/login`;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("label")}</span>
        <span className="flex items-stretch border-[3px] border-line bg-[#100d22] focus-within:border-accent">
          <input
            className="flex-1 min-w-0 bg-transparent px-3 py-2 text-right outline-none"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={t("placeholder")}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-label={t("label")}
          />
          <span className="shrink-0 px-3 py-2 text-ink-dim bg-panel-2/60 border-l-[3px] border-line whitespace-nowrap">
            .{host || "…"}
          </span>
        </span>
      </label>
      <button type="submit" className="pixel-btn pixel-btn-gold" disabled={!clean}>
        {t("cta")}
      </button>
      <p className="text-ink-dim text-sm leading-relaxed">{t("help")}</p>
    </form>
  );
}
