"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Dept = { id: number; name: string; color: string };

export function RegisterForm({ departments }: { departments: Dept[] }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">(departments[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pin !== pin2) {
      setError(t("pinMismatch"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, pin, departmentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? t("registerFailed"));
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="pixel-panel p-6 max-w-md mx-auto flex flex-col gap-4">
      <h1 className="heading text-gold text-xl">{t("registerTitle")}</h1>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("nickname")}</span>
        <input
          className="pixel-input"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t("nicknamePlaceholder")}
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">{t("department")}</span>
        <select
          className="pixel-input"
          value={departmentId}
          onChange={(e) => setDepartmentId(Number(e.target.value))}
        >
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-ink-dim text-base">{t("pinRange")}</span>
          <input
            className="pixel-input"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink-dim text-base">{t("repeatPin")}</span>
          <input
            className="pixel-input"
            type="password"
            inputMode="numeric"
            value={pin2}
            onChange={(e) => setPin2(e.target.value)}
          />
        </label>
      </div>
      {error && <p className="text-danger text-base">⚠ {error}</p>}
      <button className="pixel-btn" disabled={loading}>
        {loading ? "..." : t("joinQuest")}
      </button>
      <p className="text-base text-ink-dim text-center">
        {t("hasProfile")}{" "}
        <Link href="/login" className="text-accent-2">
          {t("login")}
        </Link>
      </p>
      <p className="text-sm text-ink-dim text-center">{t("photoLater")}</p>
    </form>
  );
}
