import Image from "next/image";
import styles from "./OfficeScene.module.css";

// Koselig kontorscene i "Stardew Valley"-stil. Selve bildet er pixelart;
// vi legger på litt subtil, levende bevegelse oppå (damp fra koppen,
// mykt CRT-glød fra skjermen og flytende +1) uten å røre bildet.

export function OfficeScene() {
  return (
    <div
      className={styles.scene}
      role="img"
      aria-label="Pixelart av en person som drikker kaffe ved pulten på et koselig kontor en regnværsdag"
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

      {/* flytende +1 ☕ */}
      <span className={`${styles.plusOne} ${styles.plusOne1}`} aria-hidden>
        +1 ☕
      </span>
      <span className={`${styles.plusOne} ${styles.plusOne2}`} aria-hidden>
        +1 🍵
      </span>
    </div>
  );
}
