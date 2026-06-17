"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Dashboard } from "@/components/Dashboard";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import { DepartmentFilter, type DeptItem } from "@/components/DepartmentFilter";
import type { Overview, LeaderboardRow } from "@/lib/stats";

const STORAGE_KEY = "bq.stats.dept";

// Eier avdelingsvalget for Statistikk-siden og deler det med både Dashboard og
// topplisten. Valget huskes i localStorage på tvers av besøk.
export function StatsClient({
  overview,
  leaderboardRows,
  deptTree,
}: {
  overview: Overview;
  leaderboardRows: LeaderboardRow[];
  deptTree: DeptItem[];
}) {
  const t = useTranslations("Stats");
  const [dept, setDept] = useState<number | null>(null);

  useEffect(() => {
    // Lagret valg leses fra localStorage etter mount (klient-kun) for å unngå
    // hydrerings-mismatch; serveren rendrer alltid «hele organisasjonen».
    const saved = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setDept(Number(saved) || null);
  }, []);

  const changeDept = (v: number | null) => {
    setDept(v);
    if (v) localStorage.setItem(STORAGE_KEY, String(v));
    else localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex flex-col gap-8">
      {deptTree.length > 0 && (
        <DepartmentFilter tree={deptTree} value={dept} onChange={changeDept} />
      )}
      <Dashboard initial={overview} dept={dept} />
      <section>
        <h2 className="heading text-accent-2 text-base mb-3">{t("bestList")}</h2>
        <LeaderboardBoard initialRows={leaderboardRows} dept={dept} />
      </section>
    </div>
  );
}
