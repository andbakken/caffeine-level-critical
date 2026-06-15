"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Celebration } from "@/components/Celebration";
import type { AwardedBadge } from "@/lib/consumption";

type Drink = { key: string; displayName: string; icon: string; color: string };

type Status =
  | { kind: "idle" }
  | { kind: "logging" }
  | { kind: "done"; drink: Drink; cooldown: boolean }
  | { kind: "error"; message: string };

export function TapClient({
  token,
  stationName,
  fixedDrink,
  drinks,
  nickname,
}: {
  token: string;
  stationName: string;
  fixedDrink: Drink | null;
  drinks: Drink[];
  nickname: string;
}) {
  const router = useRouter();
  const t = useTranslations("Tap");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [badges, setBadges] = useState<AwardedBadge[]>([]);
  const autoRan = useRef(false);

  const log = useCallback(
    async (drinkKey?: string) => {
      setStatus({ kind: "logging" });
      try {
        const res = await fetch("/api/tap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, drinkKey }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setStatus({ kind: "error", message: data.error ?? t("somethingWrong") });
          return;
        }
        const drink: Drink =
          data.drink ?? fixedDrink ?? drinks.find((d) => d.key === drinkKey) ?? drinks[0];
        setStatus({ kind: "done", drink, cooldown: Boolean(data.cooldown) });
        if (data.newBadges?.length) setBadges(data.newBadges);
        router.refresh();
      } catch {
        setStatus({ kind: "error", message: t("networkError") });
      }
    },
    [token, fixedDrink, drinks, router, t],
  );

  // ett-tapp-tagg: logg automatisk med en gang
  useEffect(() => {
    if (fixedDrink && !autoRan.current) {
      autoRan.current = true;
      log();
    }
  }, [fixedDrink, log]);

  return (
    <div className="max-w-md mx-auto text-center flex flex-col gap-6 py-6">
      <div className="pixel-panel p-4">
        <p className="text-ink-dim text-base">{t("station")}</p>
        <p className="heading text-accent-2 text-lg">{stationName}</p>
        <p className="text-ink-dim text-base mt-1">
          {t("loggedInAs")} <span className="text-gold">{nickname}</span>
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status.kind === "logging" && (
          <motion.p
            key="logging"
            className="heading text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {t("registering")}<span className="blink">_</span>
          </motion.p>
        )}

        {status.kind === "done" && (
          <motion.div
            key="done"
            initial={{ scale: 0.4, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 12 }}
            className="pixel-panel p-6"
          >
            <div className="text-7xl">{status.drink.icon}</div>
            <p className="heading text-gold text-lg mt-3">
              {status.cooldown ? "Allerede talt!" : "Registrert!"}
            </p>
            <p className="text-ink-dim text-base mt-1">
              {status.cooldown
                ? t("justRegisteredWait")
                : t("plus", { drink: status.drink.displayName })}
            </p>
            <div className="flex flex-col gap-3 mt-5">
              <button className="pixel-btn" onClick={() => log(status.drink.key)}>
                {t("logAnother")}
              </button>
              <Link href="/dashboard" className="pixel-btn pixel-btn-ghost">
                {t("toDashboard")}
              </Link>
            </div>
          </motion.div>
        )}

        {status.kind === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-danger heading text-base">⚠ {status.message}</p>
            <button className="pixel-btn mt-4" onClick={() => log()}>
              {t("tryAgain")}
            </button>
          </motion.div>
        )}

        {status.kind === "idle" && !fixedDrink && (
          <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="heading text-base mb-4">{t("whatDidYouDrink")}</p>
            <div className="grid grid-cols-3 gap-3">
              {drinks.map((d) => (
                <button
                  key={d.key}
                  className="pixel-panel p-4 flex flex-col items-center gap-2 hover:brightness-110"
                  style={{ borderColor: d.color }}
                  onClick={() => log(d.key)}
                >
                  <span className="text-5xl">{d.icon}</span>
                  <span className="font-display text-[0.55rem]">{d.displayName}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Celebration badges={badges} onDone={() => setBadges([])} />
    </div>
  );
}
