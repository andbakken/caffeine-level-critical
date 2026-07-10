import { contactRequestSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { fail, ok } from "@/lib/http";
import { CONTACT_EMAIL } from "@/lib/brand";

// Tar imot hosting-henvendelser fra skjemaet på /kom-i-gang og videresender dem
// som e-post til oss (samme manuelle oppfølging som før — men uten mailto-friksjonen
// for den besøkende). Lagrer ingenting; e-posten ER innboksen for leads.

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(req: Request) {
  // Rate-limit per IP: maks 3 henvendelser per 10 min (skjemaet er åpent for alle).
  if (!rateLimit(`contact:${clientIp(req)}`, 3, 10 * 60 * 1000)) {
    return fail("For mange forsøk – prøv igjen om litt", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Ugyldig forespørsel");
  }

  const parsed = contactRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Ugyldig skjema");
  }
  const { name, company, email, message } = parsed.data;

  await sendEmail({
    to: CONTACT_EMAIL,
    subject: `Hosting-henvendelse: ${company}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px">
        <h2>Ny hosting-henvendelse fra /kom-i-gang</h2>
        <p><b>Navn:</b> ${esc(name)}<br>
           <b>Firma:</b> ${esc(company)}<br>
           <b>E-post:</b> ${esc(email)}</p>
        ${message ? `<p><b>Melding:</b><br>${esc(message).replace(/\n/g, "<br>")}</p>` : ""}
      </div>`,
  });

  return ok({ message: "Takk! Vi tar kontakt innen én virkedag." });
}
