"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export type Branding = {
  logoPath: string | null;
  posterHeading: string | null;
  posterBody: string | null;
  requireInvite?: boolean;
  inviteCode?: string | null;
};

// Admin-fane for bedriftens branding: logo + plakat-tekst som brukes på A5-arkene.
export function BrandingManager({ branding }: { branding: Branding }) {
  const router = useRouter();
  const tp = useTranslations("Poster");
  const fileRef = useRef<HTMLInputElement>(null);

  const [logoPath, setLogoPath] = useState(branding.logoPath);
  const [heading, setHeading] = useState(branding.posterHeading ?? "");
  const [body, setBody] = useState(branding.posterBody ?? "");
  const [inviteCode, setInviteCode] = useState(branding.inviteCode ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function regenerateInvite() {
    if (!confirm("Generer ny invitasjonskode? Den gamle slutter å virke umiddelbart.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/branding/invite", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        flash(data.error ?? "Kunne ikke lage ny kode");
        return;
      }
      setInviteCode(data.code);
      flash(null, "Ny invitasjonskode laget!");
    } finally {
      setBusy(false);
    }
  }

  function flash(error: string | null, message: string | null = null) {
    setErr(error);
    setMsg(message);
    setTimeout(() => {
      setErr(null);
      setMsg(null);
    }, 3000);
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/admin/branding/logo", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        flash(data.error ?? "Opplasting feilet");
        return;
      }
      setLogoPath(data.logoPath);
      flash(null, "Logo oppdatert!");
      router.refresh();
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function saveText(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posterHeading: heading, posterBody: body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        flash(data.error ?? "Lagring feilet");
        return;
      }
      flash(null, "Tekst lagret!");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="heading text-accent-2 text-base">Profil &amp; plakater</h2>
      <p className="text-ink-dim text-base">
        Logo og tekst her brukes på de utskriftsvennlige A5-arkene du lager per brikke
        (Tagger → A5-plakat).
      </p>

      {(err || msg) && (
        <div className={`pixel-panel px-4 py-2 text-base ${err ? "text-danger" : "text-accent-2"}`}>
          {err ? `⚠ ${err}` : `✔ ${msg}`}
        </div>
      )}

      {/* ---- Invitasjonskode (kun hostet) ---- */}
      {branding.requireInvite && (
        <div className="pixel-panel p-4 flex flex-col gap-3">
          <h3 className="font-display text-sm text-gold">Invitasjonskode</h3>
          <p className="text-ink-dim text-base">
            Nye brukere må oppgi denne koden for å lage en profil. Del den med teamet ditt.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <code className="bg-[#100d22] border-[3px] border-line px-4 py-2 text-lg tracking-widest select-all">
              {inviteCode ?? "—"}
            </code>
            <button
              type="button"
              className="pixel-btn pixel-btn-ghost !py-2"
              onClick={regenerateInvite}
              disabled={busy}
            >
              Generer ny kode
            </button>
          </div>
          <p className="text-ink-dim text-sm">
            Lager du en ny kode, slutter den gamle å virke umiddelbart.
          </p>
        </div>
      )}

      {/* ---- Logo ---- */}
      <div className="pixel-panel p-4 flex items-center gap-4 flex-wrap">
        <div className="bg-white p-2 shrink-0" style={{ width: 96, height: 96 }}>
          {logoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/uploads/${logoPath}`}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-dim text-sm text-center">
              Ingen logo
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={uploadLogo}
          />
          <button
            type="button"
            className="pixel-btn pixel-btn-ghost !py-2 self-start"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            {logoPath ? "Bytt logo" : "Last opp logo"}
          </button>
          <span className="text-ink-dim text-sm">PNG, JPG, WEBP eller GIF · maks 2 MB</span>
        </div>
      </div>

      {/* ---- Plakat-tekst ---- */}
      <form onSubmit={saveText} className="pixel-panel p-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-ink-dim text-base">Overskrift på plakaten</span>
          <input
            className="pixel-input"
            value={heading}
            maxLength={80}
            onChange={(e) => setHeading(e.target.value)}
            placeholder={tp("defaultHeading")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink-dim text-base">Promotekst (kort)</span>
          <textarea
            className="pixel-input"
            value={body}
            maxLength={280}
            rows={3}
            onChange={(e) => setBody(e.target.value)}
            placeholder={tp("defaultBody")}
          />
        </label>
        <div>
          <button className="pixel-btn" disabled={busy}>
            Lagre tekst
          </button>
        </div>
        <p className="text-ink-dim text-sm">
          La feltene stå tomme for å bruke standardteksten. Teksten kan også finjusteres på
          hvert enkelt ark før utskrift.
        </p>
      </form>
    </section>
  );
}
