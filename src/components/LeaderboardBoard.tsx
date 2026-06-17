"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Avatar } from "@/components/Avatar";
import { DepartmentFilter, type DeptItem } from "@/components/DepartmentFilter";
import type { LeaderboardRow } from "@/lib/stats";
import type { Period } from "@/lib/time";

const PERIOD_KEYS: Period[] = ["today", "week", "month", "all"];

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardBoard({
  initialRows,
  compact = false,
  deptTree,
  dept: controlledDept = null,
  storageKey,
}: {
  initialRows: LeaderboardRow[];
  compact?: boolean;
  deptTree?: DeptItem[];
  /** Kontrollert avdelingsfilter (når en forelder eier valget, f.eks. Statistikk). */
  dept?: number | null;
  /** Sett for selvstyrt filter som huskes i localStorage under denne nøkkelen. */
  storageKey?: string;
}) {
  const t = useTranslations("Leaderboard");
  const [period, setPeriod] = useState<Period>("today");
  const [groupBy, setGroupBy] = useState<"user" | "department">("user");
  const [rows, setRows] = useState<LeaderboardRow[]>(initialRows);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const selfManaged = !!storageKey;
  const [ownDept, setOwnDept] = useState<number | null>(null);
  const dept = selfManaged ? ownDept : controlledDept;

  // Hent lagret avdelingsvalg (kun selvstyrt) etter mount for å unngå hydrerings-mismatch.
  useEffect(() => {
    if (!selfManaged || !storageKey) return;
    // Lagret valg leses fra localStorage etter mount (klient-kun) for å unngå
    // hydrerings-mismatch; serveren rendrer alltid «hele organisasjonen».
    const saved = localStorage.getItem(storageKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setOwnDept(Number(saved) || null);
  }, [selfManaged, storageKey]);

  const changeDept = (v: number | null) => {
    setOwnDept(v);
    if (storageKey) {
      if (v) localStorage.setItem(storageKey, String(v));
      else localStorage.removeItem(storageKey);
    }
  };

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/stats/leaderboard?period=${period}&groupBy=${groupBy}&dept=${dept ?? ""}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const d = await res.json();
        if (alive) setRows(d.rows as LeaderboardRow[]);
      } catch {
        /* ignorer */
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [period, groupBy, dept]);

  // Synlighet i avdelings-treet: en rad vises bare hvis alle forfedre er utvidet.
  const rowById = new Map(rows.map((r) => [r.id, r]));
  const isVisible = (r: LeaderboardRow) => {
    let pid = r.parentId ?? null;
    while (pid != null) {
      if (!expanded.has(pid)) return false;
      pid = rowById.get(pid)?.parentId ?? null;
    }
    return true;
  };

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const treeMode = groupBy === "department";
  const shown = treeMode ? rows.filter(isVisible) : rows;
  const visible = compact ? shown.slice(0, 5) : shown;
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="flex flex-col gap-4">
      {!compact && (
        <>
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex gap-1 flex-wrap">
              {PERIOD_KEYS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`pixel-btn !py-2 !px-3 ${period === p ? "" : "pixel-btn-ghost"}`}
                >
                  {t(p)}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setGroupBy("user")}
                className={`pixel-btn !py-2 !px-3 ${groupBy === "user" ? "" : "pixel-btn-ghost"}`}
              >
                {t("players")}
              </button>
              <button
                onClick={() => setGroupBy("department")}
                className={`pixel-btn !py-2 !px-3 ${groupBy === "department" ? "" : "pixel-btn-ghost"}`}
              >
                {t("departments")}
              </button>
            </div>
          </div>
          {selfManaged && deptTree && (
            <DepartmentFilter tree={deptTree} value={dept} onChange={changeDept} />
          )}
        </>
      )}

      <ol className="flex flex-col gap-2">
        {visible.map((r) => {
          const depth = treeMode ? (r.depth ?? 0) : 0;
          const showMedal = depth === 0 && r.rank <= 3;
          return (
            <motion.li
              key={`${groupBy}-${r.id}`}
              layout
              className="pixel-panel p-3 flex items-center gap-3"
              style={treeMode && depth > 0 ? { marginLeft: `${depth * 1.25}rem` } : undefined}
            >
              {treeMode &&
                (r.hasChildren ? (
                  <button
                    onClick={() => toggle(r.id)}
                    className="w-6 text-center text-ink-dim shrink-0"
                    aria-label={expanded.has(r.id) ? t("collapse") : t("expand")}
                  >
                    {expanded.has(r.id) ? "▾" : "▸"}
                  </button>
                ) : (
                  <span className="w-6 shrink-0" aria-hidden />
                ))}
              <span className="font-display text-base w-8 text-center">
                {showMedal ? MEDALS[r.rank - 1] : r.rank}
              </span>
              {groupBy === "user" ? (
                <Avatar avatarPath={r.avatarPath} nickname={r.name} color={r.color} size={40} />
              ) : (
                <span className="w-5 h-10 shrink-0" style={{ backgroundColor: r.color }} />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <span className="text-gold truncate">{r.name}</span>
                  <span className="font-display text-sm">{r.count}</span>
                </div>
                <div className="h-3 bg-bg-2 border border-line mt-1">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: r.color }}
                    animate={{ width: `${(r.count / max) * 100}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  />
                </div>
                {groupBy === "user" && r.departmentName && (
                  <span className="text-ink-dim text-sm">{r.departmentName}</span>
                )}
              </div>
            </motion.li>
          );
        })}
        {visible.length === 0 && <li className="text-ink-dim">{t("noData")}</li>}
      </ol>
    </div>
  );
}
