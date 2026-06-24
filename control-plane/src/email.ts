import { env } from "./env.js";

// Transaksjons-e-post via Resend (HTTP API). Uten nøkkel logges innholdet i stedet.

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.resendApiKey) {
    console.log(`[e-post – ingen RESEND_API_KEY] Til: ${to} | ${subject}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.mailFrom, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend-feil ${res.status}: ${await res.text()}`);
}

export async function sendWelcome(to: string, orgName: string, url: string): Promise<void> {
  await sendEmail(
    to,
    `Velkommen til Quest of the Roasted Bean – ${orgName}`,
    `<div style="font-family:system-ui,sans-serif;max-width:480px">
       <h2>Klart! ☕</h2>
       <p>Din instans for <strong>${orgName}</strong> er satt opp og kjører.</p>
       <p><a href="${url}/login" style="display:inline-block;background:#7c5cff;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Gå til ${url.replace(/^https?:\/\//, "")}</a></p>
       <p>Logg inn som admin med e-posten <strong>${to}</strong> – du får en innloggingslenke på e-post.</p>
     </div>`,
  );
}
