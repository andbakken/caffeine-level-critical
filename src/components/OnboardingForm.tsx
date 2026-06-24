"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function OnboardingForm() {
  const t = useTranslations("Onboarding");
  const [orgName, setOrgName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("standard");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, subdomain, email, plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? t("genericError"));
        return;
      }
      window.location.href = data.url; // til Stripe Checkout
    } catch {
      setError(t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="pixel-panel p-6 max-w-md mx-auto flex flex-col gap-4">
      <h1 className="heading text-gold text-xl">{t("title")}</h1>
      <p className="text-ink-dim text-base">{t("intro")}</p>

      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("orgName")}</span>
        <input className="pixel-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} required autoFocus />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("subdomain")}</span>
        <input
          className="pixel-input"
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
          pattern="[a-z0-9-]{3,30}"
          required
        />
        <span className="text-ink-dim text-xs">{t("subdomainHint")}</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("email")}</span>
        <input className="pixel-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("plan")}</span>
        <select className="pixel-input" value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="standard">{t("planStandard")}</option>
          <option value="team">{t("planTeam")}</option>
        </select>
      </label>

      {error && <p className="text-danger text-base">⚠ {error}</p>}
      <button className="pixel-btn pixel-btn-gold" disabled={loading}>
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
