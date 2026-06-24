"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LoginForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Admin-innlogging via e-post magic-link
  const [email, setEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  async function requestMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMagicLoading(true);
    try {
      await fetch("/api/auth/magic/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Svarer alltid likt (anti-enumerering) – vis bekreftelse uansett.
      setMagicSent(true);
    } catch {
      setError(t("somethingWrong"));
    } finally {
      setMagicLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? t("loginFailed"));
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError(t("somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="pixel-panel p-6 max-w-md mx-auto flex flex-col gap-4">
      <h1 className="heading text-gold text-xl">{t("loginTitle")}</h1>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("nickname")}</span>
        <input
          className="pixel-input"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          autoComplete="username"
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("pin")}</span>
        <input
          className="pixel-input"
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      {error && <p className="text-danger text-base">⚠ {error}</p>}
      <button className="pixel-btn" disabled={loading}>
        {loading ? "..." : t("startGame")}
      </button>
      <p className="text-base text-ink-dim text-center">
        {t("newPlayer")}{" "}
        <Link href="/register" className="text-accent-2">
          {t("createProfile")}
        </Link>
      </p>

      <details className="border-t border-ink-dim/20 pt-3">
        <summary className="text-base text-ink-dim cursor-pointer">{t("adminEmailPrompt")}</summary>
        {magicSent ? (
          <p className="text-base text-accent-2 mt-3">✓ {t("magicLinkSent")}</p>
        ) : (
          <div className="flex flex-col gap-2 mt-3">
            <input
              className="pixel-input"
              type="email"
              placeholder={t("emailLabel")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <button type="button" className="pixel-btn" disabled={magicLoading} onClick={requestMagicLink}>
              {magicLoading ? "..." : t("sendMagicLink")}
            </button>
          </div>
        )}
      </details>
    </form>
  );
}
