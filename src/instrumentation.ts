// Startes én gang når serveren booter (Next instrumentation-konvensjonen).
// Brukes KUN til demo-instansens simuleringsløkke — helt inaktiv ellers.

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.DEMO_MODE !== "1") return;

  const { ensureDemoData, simulateTick, nightlyReset } = await import("@/lib/demo");

  // DB-en kan være et øyeblikk bak containeren ved oppstart — prøv rolig.
  for (let attempt = 1; ; attempt++) {
    try {
      await ensureDemoData();
      break;
    } catch (e) {
      if (attempt >= 10) {
        console.error("[demo] klarte ikke å sette opp demo-data:", e);
        return;
      }
      await new Promise((r) => setTimeout(r, attempt * 3000));
    }
  }

  let lastDay = new Date().getDate();
  const TICK_MS = 5 * 60 * 1000;

  setInterval(async () => {
    try {
      const now = new Date();
      if (now.getDate() !== lastDay) {
        // Første tick etter midnatt: nullstill gårsdagen (gjester + forbruk)
        // og legg inn frisk kollega-historikk.
        lastDay = now.getDate();
        await nightlyReset();
        await ensureDemoData();
      }
      await simulateTick(now);
    } catch (e) {
      console.error("[demo] simuleringstick feilet:", e);
    }
  }, TICK_MS);

  console.log("[demo] demo-modus aktiv: simulering hvert 5. minutt, nattlig reset");
}
