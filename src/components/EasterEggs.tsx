"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

// Easter eggs på markedssidene — små ting folk deler videre:
//  - Konami-koden (↑↑↓↓←→←→BA) låser opp et «hemmelig merke».
//  - 10 klikk på koppen i footeren utløser konfetti og «Koppmester».
// Ren CSS/JS-lek, ingen lagring. Respekterer prefers-reduced-motion (da
// vises toasten uten konfettiregn).

declare global {
  interface Window {
    umami?: { track: (event: string) => void };
  }
}

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

const CONFETTI_COLORS = ["#ffd34d", "#39d98a", "#7c5cff", "#ff5c7c", "#b07a4b"];

type ConfettiPiece = { left: number; delay: number; duration: number; color: string };

/** Genereres i event-handlere (aldri under render — react-hooks/purity). */
function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: 60 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.6 + Math.random() * 1.4,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
}

function Confetti({ pieces }: { pieces: ConfettiPiece[] }) {
  return (
    <div className="confetti-layer" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-bit"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function EggToast({
  icon,
  title,
  body,
  confetti,
  onClose,
}: {
  icon: string;
  title: string;
  body: string;
  confetti: ConfettiPiece[];
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <>
      <Confetti pieces={confetti} />
      <button
        type="button"
        onClick={onClose}
        className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-10 z-50 pixel-panel p-5 flex items-center gap-4 text-left cursor-pointer"
        style={{ borderColor: "var(--color-gold)" }}
      >
        <span className="text-4xl wiggle" aria-hidden>
          {icon}
        </span>
        <span className="flex flex-col gap-1">
          <span className="heading text-gold text-sm">{title}</span>
          <span className="text-ink-dim text-sm leading-relaxed max-w-60">{body}</span>
        </span>
      </button>
    </>
  );
}

/** Lytter etter Konami-koden på alle markedssider. */
export function KonamiEgg() {
  const t = useTranslations("EasterEggs");
  const [confetti, setConfetti] = useState<ConfettiPiece[] | null>(null);
  const progress = useRef(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      progress.current = e.code === KONAMI[progress.current] ? progress.current + 1 : e.code === KONAMI[0] ? 1 : 0;
      if (progress.current === KONAMI.length) {
        progress.current = 0;
        setConfetti(makeConfetti());
        window.umami?.track("easter_konami");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!confetti) return null;
  return (
    <EggToast
      icon="🕹️"
      title={t("konamiTitle")}
      body={t("konamiBody")}
      confetti={confetti}
      onClose={() => setConfetti(null)}
    />
  );
}

/** Koppen i footeren: 10 klikk → konfetti og «Koppmester». */
export function FooterCupEgg() {
  const t = useTranslations("EasterEggs");
  const [clicks, setClicks] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[] | null>(null);
  const done = confetti !== null;

  function click() {
    const n = clicks + 1;
    setClicks(n);
    if (n === 10) {
      setConfetti(makeConfetti());
      window.umami?.track("easter_cup");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={click}
        className="cursor-pointer select-none"
        aria-label={t("cupLabel")}
        title={t("cupLabel")}
        style={clicks > 0 && !done ? { transform: `rotate(${(clicks % 2 ? -1 : 1) * clicks}deg)`, display: "inline-block" } : undefined}
      >
        ☕
      </button>
      {confetti && (
        <EggToast
          icon="👑"
          title={t("cupTitle")}
          body={t("cupBody")}
          confetti={confetti}
          onClose={() => {
            setConfetti(null);
            setClicks(0);
          }}
        />
      )}
    </>
  );
}
