"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import type { Overview } from "@/lib/stats";

export function Dashboard({
  initial,
  dept = null,
}: {
  initial: Overview;
  /** Kontrollert avdelingsfilter — scoper alle widgets til subtreet. */
  dept?: number | null;
}) {
  const t = useTranslations("Stats");
  const [data, setData] = useState<Overview>(initial);
  // «nå» holdes i state og oppdateres i intervall-callbacken under, slik at
  // relativ tid forblir fersk uten å lese Date.now() under render (urent).
  const [now, setNow] = useState(() => Date.now());

  const timeAgo = (iso: string): string => {
    const diff = now - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return t("agoNow");
    if (min < 60) return t("agoMin", { min });
    const h = Math.floor(min / 60);
    if (h < 24) return t("agoHour", { h });
    return t("agoDay", { d: Math.floor(h / 24) });
  };

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/stats/overview?dept=${dept ?? ""}`, { cache: "no-store" });
        if (!res.ok) return;
        const d = (await res.json()) as Overview;
        if (alive) {
          setData(d);
          setNow(Date.now());
        }
      } catch {
        /* ignorer */
      }
    };
    load();
    const id = setInterval(load, 8000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [dept]);

  const maxDay = Math.max(1, ...data.last7.map((d) => d.count));
  const maxDrink = Math.max(1, ...data.drinkStats.map((d) => d.today));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <BigStat label={t("today")} value={data.totalToday} color="var(--color-gold)" />
        <BigStat label={t("thisWeek")} value={data.totalWeek} color="var(--color-accent-2)" />
        <BigStat label={t("total")} value={data.totalAll} color="var(--color-accent)" />
      </div>

      <div className="pixel-panel p-4">
        <h2 className="heading text-accent-2 text-base mb-4">{t("todayPerDrink")}</h2>
        <div className="flex flex-col gap-3">
          {data.drinkStats.map((d) => (
            <div key={d.key} className="flex items-center gap-3">
              <span className="text-3xl w-10 text-center">{d.icon}</span>
              <div className="flex-1 h-6 bg-bg-2 border-2 border-line">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: d.color }}
                  animate={{ width: `${(d.today / maxDrink) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                />
              </div>
              <span className="font-display text-sm w-10 text-right">{d.today}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pixel-panel p-4">
        <h2 className="heading text-accent-2 text-base mb-4">{t("last7days")}</h2>
        <div className="flex items-end justify-between gap-2 h-40">
          {data.last7.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="font-display text-[0.55rem] text-ink-dim">{d.count}</span>
              <motion.div
                className="w-full bg-accent"
                style={{ minHeight: 4 }}
                animate={{ height: `${(d.count / maxDay) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              />
              <span className="font-display text-[0.5rem] text-ink-dim">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pixel-panel p-4">
        <h2 className="heading text-accent-2 text-base mb-4">{t("liveFeed")}</h2>
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {data.recent.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-base"
              >
                <span
                  className="w-2 h-6 shrink-0"
                  style={{ backgroundColor: r.deptColor }}
                  aria-hidden
                />
                <span className="text-2xl">{r.drinkIcon}</span>
                <span className="text-gold">{r.nickname}</span>
                <span className="text-ink-dim">{t("took", { drink: r.drinkName.toLowerCase() })}</span>
                {r.source === "tag" && <span title={t("scannedTag")}>📟</span>}
                <span className="text-ink-dim ml-auto text-sm">{timeAgo(r.createdAt)}</span>
              </motion.li>
            ))}
          </AnimatePresence>
          {data.recent.length === 0 && (
            <li className="text-ink-dim">{t("noneYet")}</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function BigStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="pixel-panel p-3 sm:p-4 text-center">
      <AnimatedNumber
        value={value}
        className="font-display text-2xl sm:text-4xl"
      />
      <div className="text-ink-dim text-sm mt-2" style={{ color }}>
        {label}
      </div>
    </div>
  );
}
