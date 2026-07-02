// Henter det globale, anonyme kopp-totalet fra control-plane (kun aggregat, ingen
// person- eller kundedata). Brukes som «social proof» på landingssiden. Kalles kun
// server-side; STATS_TOKEN eksponeres aldri mot nettleseren.

export async function getGlobalCups(): Promise<number | null> {
  const base = process.env.CONTROL_PLANE_URL;
  const token = process.env.STATS_TOKEN;
  if (!base || !token) return null; // ikke konfigurert (f.eks. selvhostet/dev) → skjul

  try {
    const res = await fetch(`${base}/internal/stats`, {
      headers: { "x-stats-token": token },
      // Tallet endrer seg sakte; cache i én time så vi ikke spør control-plane per treff.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { totalCups?: number };
    return typeof data.totalCups === "number" ? data.totalCups : null;
  } catch {
    return null; // control-plane utilgjengelig → skjul stille
  }
}
