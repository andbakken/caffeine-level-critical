// Transaksjons-e-post via Resend (HTTP API – ingen SDK-avhengighet).
// Uten RESEND_API_KEY (lokal dev / selvhosting) logges e-posten til konsollen i stedet.

import { APP_NAME } from "@/lib/brand";

const RESEND_API = "https://api.resend.com/emails";

type SendArgs = { to: string; subject: string; html: string };

export async function sendEmail({ to, subject, html }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM ?? "no-reply@localhost";

  if (!apiKey) {
    console.log(`[e-post – ingen RESEND_API_KEY] Til: ${to} | ${subject}\n${html}`);
    return;
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    throw new Error(`Resend-feil ${res.status}: ${await res.text()}`);
  }
}

/** Sender en innloggingslenke (magic-link) til admin. */
export async function sendMagicLink(to: string, url: string): Promise<void> {
  await sendEmail({
    to,
    subject: `Innloggingslenke – ${APP_NAME}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px">
        <h2>Logg inn</h2>
        <p>Trykk på knappen for å logge inn. Lenken er gyldig i 15 minutter og kan brukes én gang.</p>
        <p><a href="${url}" style="display:inline-block;background:#7c5cff;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Logg inn</a></p>
        <p style="color:#666;font-size:13px">Hvis du ikke ba om denne e-posten kan du se bort fra den.</p>
      </div>`,
  });
}
