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
    </form>
  );
}
