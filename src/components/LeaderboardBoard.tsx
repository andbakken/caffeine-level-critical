"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Avatar } from "@/components/Avatar";
import type { LeaderboardRow } from "@/lib/stats";
import type { Period } from "@/lib/time";

const PERIOD_KEYS: Period[] = ["today", "week", "month", "all"];

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardBoard({
  initialRows,
  compact = false,
}: {
  initialRows: LeaderboardRow[];
  compact?: boolean;
}) {
  const t = useTranslations("Leaderboard");
  const [period, setPeriod] = useState<Period>("today");
  const [groupBy, setGroupBy] = useState<"user" | "department">("user");
  const [rows, setRows] = useState<LeaderboardRow[]>(initialRows);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/stats/leaderboard?period=${period}&groupBy=${groupBy}`, {
          cache: "no-store",
        });
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
  }, [period, groupBy]);

  const visible = compact ? rows.slice(0, 5) : rows;
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="flex flex-col gap-4">
      {!compact && (
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
      )}

      <ol className="flex flex-col gap-2">
        {visible.map((r) => (
          <motion.li
            key={`${groupBy}-${r.id}`}
            layout
            className="pixel-panel p-3 flex items-center gap-3"
          >
            <span className="font-display text-base w-8 text-center">
              {r.rank <= 3 ? MEDALS[r.rank - 1] : r.rank}
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
        ))}
        {visible.length === 0 && <li className="text-ink-dim">{t("noData")}</li>}
      </ol>
    </div>
  );
}
