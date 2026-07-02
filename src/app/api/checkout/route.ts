import { json, fail } from "@/lib/http";
import { clientIp } from "@/lib/rateLimit";

// Videresender onboarding til control-plane (server-til-server, så Stripe/CP-detaljer
// aldri eksponeres mot nettleseren og vi slipper CORS). CONTROL_PLANE_URL settes kun
// på marketing-instansen (intern docker-adresse, f.eks. http://control-plane:8080).
export async function POST(req: Request) {
  const cp = process.env.CONTROL_PLANE_URL;
  if (!cp) return fail("Onboarding er ikke tilgjengelig her.", 503);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Ugyldig forespørsel");
  }

  let res: Response;
  try {
    res = await fetch(`${cp}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Videresend klient-IP så control-plane kan rate-limite per faktisk bruker,
        // ikke per marketing-container (som ellers ville sett all trafikk fra én IP).
        "X-Forwarded-For": clientIp(req),
      },
      body: JSON.stringify(body),
    });
  } catch {
    return fail("Kunne ikke nå betalingstjenesten.", 502);
  }

  const data = await res.json().catch(() => ({}));
  return json(data, res.status);
}
