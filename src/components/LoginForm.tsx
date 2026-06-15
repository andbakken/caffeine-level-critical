"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
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
        setError(data.error ?? "Innlogging feilet");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="pixel-panel p-6 max-w-md mx-auto flex flex-col gap-4">
      <h1 className="heading text-gold text-xl">Logg inn</h1>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">Kallenavn</span>
        <input
          className="pixel-input"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          autoComplete="username"
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">PIN</span>
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
        {loading ? "..." : "Start spillet"}
      </button>
      <p className="text-base text-ink-dim text-center">
        Ny spiller?{" "}
        <Link href="/register" className="text-accent-2">
          Lag profil
        </Link>
      </p>
    </form>
  );
}
