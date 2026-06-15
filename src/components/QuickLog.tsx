"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Celebration } from "@/components/Celebration";
import type { AwardedBadge } from "@/lib/consumption";

type Drink = { key: string; displayName: string; icon: string; color: string };

export function QuickLog({ drinks }: { drinks: Drink[] }) {
  const router = useRouter();
  const t = useTranslations("QuickLog");
  const [busy, setBusy] = useState<string | null>(null);
  const [pop, setPop] = useState<{ key: string; id: number } | null>(null);
  const [badges, setBadges] = useState<AwardedBadge[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  async function log(drink: Drink) {
    if (busy) return;
    setBusy(drink.key);
    try {
      const res = await fetch("/api/consumptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drinkKey: drink.key }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setToast(data.error ?? t("somethingWrong"));
        return;
      }
      if (data.cooldown) {
        setToast(data.message ?? t("alreadyLogged"));
        return;
      }
      setPop({ key: drink.key, id: Date.now() });
      setToast(`+1 ${drink.displayName} ${drink.icon}`);
      if (data.newBadges?.length) setBadges(data.newBadges);
      router.refresh();
    } catch {
      setToast(t("networkError"));
    } finally {
      setBusy(null);
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {drinks.map((d) => (
          <button
            key={d.key}
            onClick={() => log(d)}
            disabled={busy !== null}
            className="pixel-panel relative p-4 flex flex-col items-center gap-2 hover:brightness-110 active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-60"
            style={{ borderColor: d.color }}
          >
            <span className="text-4xl sm:text-5xl">{d.icon}</span>
            <span className="font-display text-[0.6rem] sm:text-xs">{d.displayName}</span>
            <AnimatePresence>
              {pop?.key === d.key && (
                <motion.span
                  key={pop.id}
                  className="absolute top-1 right-2 text-gold font-display text-sm pointer-events-none"
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: -36, opacity: 0 }}
                  transition={{ duration: 0.9 }}
                >
                  +1
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pixel-panel px-4 py-2 text-base"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <Celebration badges={badges} onDone={() => setBadges([])} />
    </div>
  );
}
