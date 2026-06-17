"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { THRESHOLDLESS_RULES, type RuleType } from "@/lib/achievements";

export type AdminAchievement = {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  ruleType: string;
  threshold: number;
  drinkId: number | null;
  sortOrder: number;
  isActive: boolean;
  earnedCount: number;
};

type DrinkOpt = { id: number; displayName: string; icon: string };

const RULE_LABELS: Record<string, string> = {
  total: "Antall kopper totalt",
  distinct: "Antall ulike drikketyper",
  drink: "Antall av én bestemt drikke",
  before_hour: "En kopp før et klokkeslett",
  after_hour: "En kopp etter et klokkeslett",
  drink_each: "Minst N av HVER drikke",
  streak: "Antall dager på rad",
  day_total: "Antall på samme dag",
  weekend: "Logg en kopp i helgen",
};

function isThresholdless(ruleType: string): boolean {
  return THRESHOLDLESS_RULES.includes(ruleType as RuleType);
}

function isHourRule(ruleType: string): boolean {
  return ruleType === "before_hour" || ruleType === "after_hour";
}

type Draft = {
  name: string;
  icon: string;
  description: string;
  ruleType: string;
  threshold: number;
  drinkId: number | "";
  sortOrder: number;
  isActive: boolean;
};

function ruleSummary(a: AdminAchievement, drinks: DrinkOpt[]): string {
  switch (a.ruleType) {
    case "total":
      return `${a.threshold} kopper totalt`;
    case "distinct":
      return `${a.threshold} ulike drikketyper`;
    case "drink": {
      const d = drinks.find((x) => x.id === a.drinkId);
      return `${a.threshold} × ${d ? `${d.icon} ${d.displayName}` : "drikke"}`;
    }
    case "before_hour":
      return `kopp før kl. ${String(a.threshold).padStart(2, "0")}`;
    case "after_hour":
      return `kopp kl. ${String(a.threshold).padStart(2, "0")} eller senere`;
    case "drink_each":
      return `${a.threshold} av hver drikke`;
    case "streak":
      return `${a.threshold} dager på rad`;
    case "day_total":
      return `${a.threshold} på samme dag`;
    case "weekend":
      return "kopp i helgen (lør/søn)";
    default:
      return a.ruleType;
  }
}

const EMPTY: Draft = {
  name: "",
  icon: "",
  description: "",
  ruleType: "total",
  threshold: 1,
  drinkId: "",
  sortOrder: 0,
  isActive: true,
};

export function AchievementManager({
  achievements,
  drinks,
}: {
  achievements: AdminAchievement[];
  drinks: DrinkOpt[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function flash(error: string | null, message: string | null = null) {
    setErr(error);
    setMsg(message);
    setTimeout(() => {
      setErr(null);
      setMsg(null);
    }, 3000);
  }

  function startNew() {
    setDraft({ ...EMPTY, drinkId: drinks[0]?.id ?? "", sortOrder: achievements.length + 1 });
    setEditingId("new");
  }

  function startEdit(a: AdminAchievement) {
    setDraft({
      name: a.name,
      icon: a.icon,
      description: a.description,
      ruleType: a.ruleType,
      threshold: a.threshold,
      drinkId: a.drinkId ?? (drinks[0]?.id ?? ""),
      sortOrder: a.sortOrder,
      isActive: a.isActive,
    });
    setEditingId(a.id);
  }

  function cancel() {
    setEditingId(null);
    setDraft(EMPTY);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return flash("Mangler navn");
    if (!draft.icon.trim()) return flash("Mangler ikon");
    if (draft.ruleType === "drink" && !draft.drinkId) return flash("Velg drikke");

    const payload = {
      name: draft.name,
      icon: draft.icon,
      description: draft.description,
      ruleType: draft.ruleType,
      threshold: isThresholdless(draft.ruleType) ? 1 : draft.threshold,
      drinkId: draft.ruleType === "drink" ? draft.drinkId : null,
      sortOrder: draft.sortOrder,
      isActive: draft.isActive,
    };

    const isNew = editingId === "new";
    const url = isNew ? "/api/admin/achievements" : `/api/admin/achievements/${editingId}`;

    setBusy(true);
    try {
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        flash(data.error ?? "Lagring feilet");
        return;
      }
      cancel();
      flash(null, isNew ? "Merke opprettet!" : "Merke oppdatert!");
      router.refresh();
    } catch {
      flash("Nettverksfeil");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(a: AdminAchievement) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/achievements/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !a.isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) flash(data.error ?? "Kunne ikke endre status");
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(a: AdminAchievement) {
    if (
      !confirm(
        a.earnedCount > 0
          ? `${a.earnedCount} bruker(e) har dette merket. Slette likevel? Det fjernes fra alle.`
          : "Slette dette merket?",
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/achievements/${a.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) flash(data.error ?? "Sletting feilet");
      else {
        flash(null, "Merke slettet");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  const thresholdLabel = isHourRule(draft.ruleType)
    ? "Klokkeslett (0–23)"
    : draft.ruleType === "streak"
      ? "Antall dager"
      : "Antall";

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="heading text-accent-2 text-base">Merker</h2>
        {editingId === null && (
          <button className="pixel-btn !py-2 !px-3" onClick={startNew}>
            + Nytt merke
          </button>
        )}
      </div>

      {(err || msg) && (
        <div className={`pixel-panel px-4 py-2 text-base ${err ? "text-danger" : "text-accent-2"}`}>
          {err ? `⚠ ${err}` : `✔ ${msg}`}
        </div>
      )}

      {editingId !== null && (
        <form onSubmit={save} className="pixel-panel p-4 flex flex-col gap-3">
          <div className="font-display text-sm text-gold">
            {editingId === "new" ? "Nytt merke" : "Rediger merke"}
          </div>
          <div className="grid sm:grid-cols-[5rem_1fr] gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-ink-dim text-base">Ikon</span>
              <input
                className="pixel-input text-center"
                value={draft.icon}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                placeholder="🏆"
                maxLength={4}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-dim text-base">Navn</span>
              <input
                className="pixel-input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="f.eks. Tedronning"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-ink-dim text-base">Beskrivelse</span>
            <input
              className="pixel-input"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Vises som hjelpetekst på merket"
            />
          </label>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-ink-dim text-base">Regel</span>
              <select
                className="pixel-input"
                value={draft.ruleType}
                onChange={(e) => setDraft({ ...draft, ruleType: e.target.value })}
              >
                {Object.entries(RULE_LABELS).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {!isThresholdless(draft.ruleType) && (
              <label className="flex flex-col gap-1">
                <span className="text-ink-dim text-base">{thresholdLabel}</span>
                <input
                  type="number"
                  min={isHourRule(draft.ruleType) ? 0 : 1}
                  max={isHourRule(draft.ruleType) ? 23 : undefined}
                  className="pixel-input"
                  value={draft.threshold}
                  onChange={(e) => setDraft({ ...draft, threshold: Number(e.target.value) })}
                />
              </label>
            )}
            {draft.ruleType === "drink" && (
              <label className="flex flex-col gap-1">
                <span className="text-ink-dim text-base">Drikke</span>
                <select
                  className="pixel-input"
                  value={draft.drinkId}
                  onChange={(e) =>
                    setDraft({ ...draft, drinkId: e.target.value ? Number(e.target.value) : "" })
                  }
                >
                  {drinks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.icon} {d.displayName}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="grid sm:grid-cols-3 gap-3 items-end">
            <label className="flex flex-col gap-1">
              <span className="text-ink-dim text-base">Sortering</span>
              <input
                type="number"
                className="pixel-input"
                value={draft.sortOrder}
                onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
              />
            </label>
            <label className="flex items-center gap-2 text-base sm:col-span-2">
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              />
              <span>Aktiv (deles ut automatisk)</span>
            </label>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="pixel-btn" disabled={busy}>
              {busy ? "..." : "Lagre"}
            </button>
            <button type="button" className="pixel-btn pixel-btn-ghost" onClick={cancel}>
              Avbryt
            </button>
          </div>
        </form>
      )}

      {achievements.length === 0 ? (
        <p className="text-ink-dim text-base">Ingen merker ennå.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`pixel-panel p-3 flex items-center gap-3 flex-wrap ${
                a.isActive ? "" : "opacity-50"
              }`}
            >
              <span className="text-3xl">{a.icon}</span>
              <div className="flex-1 min-w-[10rem]">
                <div className="text-base">
                  {a.name}
                  {!a.isActive && <span className="text-ink-dim text-sm"> · inaktiv</span>}
                </div>
                <div className="text-ink-dim text-sm">
                  {ruleSummary(a, drinks)} · {a.earnedCount} opptjent
                </div>
              </div>
              <button
                className="pixel-btn pixel-btn-ghost !py-2 !px-3"
                onClick={() => toggleActive(a)}
                disabled={busy}
              >
                {a.isActive ? "Skjul" : "Aktiver"}
              </button>
              <button
                className="pixel-btn pixel-btn-ghost !py-2 !px-3"
                onClick={() => startEdit(a)}
                disabled={busy}
              >
                Rediger
              </button>
              <button
                className="pixel-btn pixel-btn-danger !py-2 !px-3"
                onClick={() => remove(a)}
                disabled={busy}
              >
                Slett
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
