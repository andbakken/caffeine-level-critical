// Hvilken variant av appen kjører vi? Én kilde, så sikkerhetsreglene ikke spres
// utover som løse process.env-sjekker.
//
// Tre varianter av samme image (se src/proxy.ts):
//   - Apex/marketing: ingen flagg.
//   - Hostet tenant (IS_TENANT=1, satt av control-plane/src/provision.ts).
//   - Selvhost (SELF_HOST=1).
//
// Alt som strammes inn av sikkerhetshensyn skal gates på isTenant(). Selvhostet
// kjører på et kontornett og eies av brukeren selv – der er kallenavn + kort PIN
// et bevisst, greit valg, og skal IKKE endres.

/** Sann kun på en hostet tenant-instans (betalende kunde på eget subdomene). */
export function isTenant(): boolean {
  return process.env.IS_TENANT === "1";
}

/** Minste tillatte PIN-lengde når en PIN settes. Håndheves ved SETTING, ikke ved
 *  innlogging – gamle, kortere PIN-er skal fortsatt virke til de byttes. */
export function minPinLength(): number {
  return isTenant() ? 6 : 4;
}
