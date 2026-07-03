import { prisma } from "@/lib/db";
import { magicRequestSchema } from "@/lib/validation";
import { createLoginToken } from "@/lib/magicLink";
import { sendMagicLink } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { fail, ok, requestOrigin } from "@/lib/http";

// Ber om en magic-link. Svarer alltid likt (ok) uansett om e-posten finnes –
// hindrer at noen kan kartlegge hvilke adresser som er admin (e-post-enumerering).
export async function POST(req: Request) {
  // Rate-limit per IP: maks 5 forsøk per 10 min.
  if (!rateLimit(`magic:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return fail("For mange forsøk – prøv igjen om litt", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Ugyldig forespørsel");
  }

  const parsed = magicRequestSchema.safeParse(body);
  if (!parsed.success) return fail("Fyll inn en gyldig e-postadresse");
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.isActive) {
    const token = await createLoginToken(user.id);
    // Runtime-origin (riktig tenant-domene) – IKKE NEXT_PUBLIC_SITE_URL (build-time apex).
    const base = requestOrigin(req);
    const url = `${base}/api/auth/magic/verify?token=${token}`;
    await sendMagicLink(email, url);
  }

  return ok({ message: "Hvis adressen finnes, er en innloggingslenke sendt." });
}
