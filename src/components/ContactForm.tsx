"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

// Umami injiseres kun på apex (se marketing-layout); track-kallene er derfor
// alltid valgfrie. Events: form_start (første fokus) og form_submit (vellykket).
declare global {
  interface Window {
    umami?: { track: (event: string) => void };
  }
}
const track = (event: string) => window.umami?.track(event);

/** Hosting-henvendelse fra /kom-i-gang — erstatter den gamle mailto-lenken. */
export function ContactForm() {
  const t = useTranslations("Contact");

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const started = useRef(false);

  function onStart() {
    if (started.current) return;
    started.current = true;
    track("form_start");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, email, message: message || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? t("formError"));
        return;
      }
      track("form_submit");
      setSent(true);
    } catch {
      setError(t("formError"));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="pixel-panel p-6 flex flex-col gap-3 text-center">
        <p className="font-display text-3xl text-accent-2">✓</p>
        <h2 className="heading text-gold text-base">{t("formSuccessTitle")}</h2>
        <p className="text-ink-dim text-base leading-relaxed">{t("formSuccessBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" onFocus={onStart}>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("formName")}</span>
        <input
          className="pixel-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("formCompany")}</span>
        <input
          className="pixel-input"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          autoComplete="organization"
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("formEmail")}</span>
        <input
          className="pixel-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("formMessage")}</span>
        <textarea
          className="pixel-input min-h-24"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
        />
      </label>
      {error && <p className="text-danger text-base">⚠ {error}</p>}
      <button className="pixel-btn pixel-btn-gold" disabled={loading}>
        {loading ? "..." : t("formSubmit")}
      </button>
    </form>
  );
}
