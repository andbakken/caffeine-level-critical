"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Dept = { id: number; name: string; color: string };

export function RegisterForm({ departments }: { departments: Dept[] }) {
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
      setError("PIN-kodene er ikke like");
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
        setError(data.error ?? "Registrering feilet");
        return;
      }
      router.push("/me");
      router.refresh();
    } catch {
      setError("Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="pixel-panel p-6 max-w-md mx-auto flex flex-col gap-4">
      <h1 className="heading text-gold text-xl">Lag profil</h1>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">Kallenavn</span>
        <input
          className="pixel-input"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="f.eks. KoffeinKari"
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-base">Avdeling</span>
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
          <span className="text-ink-dim text-base">PIN (4–8 siffer)</span>
          <input
            className="pixel-input"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink-dim text-base">Gjenta PIN</span>
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
        {loading ? "..." : "Bli med i questen"}
      </button>
      <p className="text-base text-ink-dim text-center">
        Har du profil?{" "}
        <Link href="/login" className="text-accent-2">
          Logg inn
        </Link>
      </p>
      <p className="text-sm text-ink-dim text-center">
        Bilde kan du legge til etterpå på profilsiden.
      </p>
    </form>
  );
}
