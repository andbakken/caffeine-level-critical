import styles from "./OfficeScene.module.css";

// Kontorscene i pixel-stil: figuren løper på stedet mens møblene scroller
// forbi i parallax, så det ser ut som han jogger gjennom lokalet og slurker kaffe.

const DESKS = ["a", "b", "plant", "a", "cooler", "b", "a", "plant"] as const;

function Furniture() {
  // dobbel rad for sømløs looping (track flyttes -50%)
  const row = [...DESKS, ...DESKS];
  return (
    <div className={styles.furnitureTrack} aria-hidden>
      {row.map((kind, i) => (
        <div key={i} className={styles.unit}>
          {kind === "plant" ? (
            <div className={styles.plant}>
              <span className={styles.leaves} />
              <span className={styles.pot} />
            </div>
          ) : kind === "cooler" ? (
            <div className={styles.cooler}>
              <span className={styles.coolerTank} />
              <span className={styles.coolerBody} />
            </div>
          ) : (
            <div className={`${styles.desk} ${kind === "b" ? styles.deskB : ""}`}>
              <span className={styles.monitorScreen} />
              <span className={styles.monitorStand} />
              <span className={styles.deskTop} />
              <span className={styles.deskLeg} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Runner() {
  return (
    <div className={styles.runner} aria-hidden>
      <div className={styles.guy}>
        {/* damp fra koppen */}
        <span className={`${styles.steam} ${styles.steam1}`} />
        <span className={`${styles.steam} ${styles.steam2}`} />
        <span className={`${styles.steam} ${styles.steam3}`} />

        {/* hode */}
        <span className={styles.hair} />
        <span className={styles.head} />
        <span className={styles.eye} />
        <span className={styles.smile} />

        {/* kropp */}
        <span className={styles.torso} />

        {/* bakre arm */}
        <span className={styles.armBack} />

        {/* fremre arm med kaffekopp (slurker) */}
        <span className={styles.armFront}>
          <span className={styles.mug} />
          <span className={styles.mugHandle} />
        </span>

        {/* bein som veksler */}
        <span className={`${styles.leg} ${styles.legBack}`} />
        <span className={`${styles.leg} ${styles.legFront}`} />
      </div>
      <span className={styles.shadow} />
    </div>
  );
}

export function OfficeScene() {
  return (
    <div className={styles.scene} role="img" aria-label="Pixelfigur som løper og drikker kaffe i et kontorlandskap">
      {/* vindu med drivende skyer */}
      <div className={styles.window}>
        <span className={styles.sun} />
        <span className={`${styles.cloud} ${styles.cloud1}`} />
        <span className={`${styles.cloud} ${styles.cloud2}`} />
        <span className={styles.windowBarV} />
        <span className={styles.windowBarH} />
      </div>

      {/* veggdekor */}
      <span className={styles.clock} />
      <span className={styles.poster} />

      {/* møbler i parallax */}
      <div className={styles.furnitureWrap}>
        <Furniture />
      </div>

      {/* gulv + figur */}
      <div className={styles.floor} />
      <Runner />

      {/* flytende +1 ☕ */}
      <span className={`${styles.plusOne} ${styles.plusOne1}`}>+1 ☕</span>
      <span className={`${styles.plusOne} ${styles.plusOne2}`}>+1 🍵</span>
    </div>
  );
}
