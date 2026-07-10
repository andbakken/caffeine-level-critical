"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./OfficeScene.module.css";

// Koselig kontorscene i "Stardew Valley"-stil — og landingssidens mini-spill:
// trykk på koppen → +1 ☕ flyr opp, du klatrer på kontor-topplista i hjørnet,
// og etter 3 trykk låses et ekte merke («Trippel») opp. Hele kjerneloopen
// demonstrert på ti sekunder, uten registrering og uten backend.

declare global {
  interface Window {
    umami?: { track: (event: string) => void };
  }
}

type Rival = { name: string; dept: string; cups: number };

// Startpoeng for de fiktive kollegene: du passerer én på 3 (samtidig med
// merket) og tar ledelsen på 5 — liten, rask progresjon.
const RIVAL_CUPS = [4, 2];
const BADGE_AT = 3;

export function OfficeScene() {
  const t = useTranslations("HeroGame");
  const [taps, setTaps] = useState(0);
  const [floats, setFloats] = useState<number[]>([]);
  const nextId = useRef(0);

  const rivals = (t.raw("rivals") as { name: string; dept: string }[]).map((r, i) => ({
    ...r,
    cups: RIVAL_CUPS[i] ?? 1,
  }));
  const you: Rival = { name: t("you"), dept: t("youDept"), cups: taps };
  // Ved likt antall vinner rivalen — da «passerer» du først når du er forbi.
  const board = [...rivals, you].sort((a, b) => b.cups - a.cups || (a === you ? 1 : -1));
  const unlocked = taps >= BADGE_AT;

  function tap() {
    if (taps === 0) window.umami?.track("hero_tap");
    setTaps((n) => n + 1);
    const id = nextId.current++;
    setFloats((f) => [...f, id]);
    // Ryddes etter at float-animasjonen (1s) er ferdig.
    setTimeout(() => setFloats((f) => f.filter((x) => x !== id)), 1100);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={tap}
        className={styles.scene}
        aria-label={t("tapLabel")}
      >
        <Image
          src="/office-scene.png"
          alt=""
          fill
          priority
          unoptimized
          sizes="(max-width: 1024px) 100vw, 600px"
          className={styles.art}
        />

        {/* mykt glød fra skjermen */}
        <span className={styles.screenGlow} aria-hidden />

        {/* damp som stiger fra koppen */}
        <span className={`${styles.steam} ${styles.steam1}`} aria-hidden />
        <span className={`${styles.steam} ${styles.steam2}`} aria-hidden />
        <span className={`${styles.steam} ${styles.steam3}`} aria-hidden />

        {/* hint til den nysgjerrige — forsvinner etter første trykk */}
        {taps === 0 && (
          <span className={styles.hint} aria-hidden>
            {t("hint")}
          </span>
        )}

        {/* +1 ☕ per trykk */}
        {floats.map((id) => (
          <span key={id} className={styles.tapFloat} aria-hidden>
            +1 ☕
          </span>
        ))}

        {/* mini-toppliste (HUD) — oppdateres for hvert trykk */}
        <span className={styles.hud} aria-hidden={taps === 0}>
          <span className={styles.hudTitle}>{t("hudTitle")}</span>
          {board.map((p) => (
            <span
              key={p.name}
              className={`${styles.hudRow} ${p === you ? styles.hudYou : ""}`}
            >
              <span className={styles.hudName}>
                {p.name} · {p.dept}
              </span>
              <span>{p.cups}</span>
            </span>
          ))}
        </span>

        {/* merke låses opp etter tredje kopp */}
        {unlocked && (
          <span className={styles.badgeToast} role="status">
            🎰 {t("badgeUnlocked", { badge: t("badgeName") })}
          </span>
        )}
      </button>
      <p className="text-ink-dim text-xs text-center leading-relaxed" aria-live="polite">
        {taps === 0
          ? t("caption")
          : unlocked
            ? t("captionUnlocked")
            : t("captionTapped", { count: taps })}
      </p>
    </div>
  );
}
