"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import type { AwardedBadge } from "@/lib/consumption";

export function Celebration({
  badges,
  onDone,
}: {
  badges: AwardedBadge[];
  onDone: () => void;
}) {
  useEffect(() => {
    if (badges.length === 0) return;
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [badges, onDone]);

  return (
    <AnimatePresence>
      {badges.length > 0 && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDone}
        >
          <motion.div
            className="pixel-panel p-6 text-center max-w-sm w-full"
            initial={{ scale: 0.5, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
          >
            <p className="heading text-gold text-lg mb-4 blink">★ NYTT MERKE! ★</p>
            <div className="flex flex-col gap-4">
              {badges.map((b) => (
                <motion.div
                  key={b.key}
                  className="flex items-center gap-4"
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-5xl wiggle">{b.icon}</span>
                  <span className="heading text-base text-accent-2 text-left">{b.name}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-ink-dim text-base mt-5">Trykk for å lukke</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
