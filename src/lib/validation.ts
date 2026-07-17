import { z } from "zod";
import { minPinLength } from "@/lib/deployment";

export const nicknameSchema = z
  .string()
  .trim()
  .min(2, "Kallenavn må ha minst 2 tegn")
  .max(20, "Kallenavn kan ha maks 20 tegn")
  .regex(/^[\p{L}0-9 _\-]+$/u, "Kun bokstaver, tall, mellomrom, _ og -");

// Grov form. Selve styrkekravet ligger i validatePin() under, som kjenner
// deployment-varianten (tenant krever 6 sifre, selvhost 4).
export const pinSchema = z.string().regex(/^\d{4,8}$/, "PIN må være 4–8 sifre");

/** Trivielle PIN-er som ellers ville passert lengdekravet. Holdes kort med vilje:
 *  mønstrene under (like sifre, sekvenser) fanger de fleste, denne tar resten. */
const PIN_BLOCKLIST = new Set([
  "1004", "2000", "2580", "1212", "6969", "1122", "1313", "4321",
  "123123", "112233", "121212", "696969", "123321", "654321", "159753",
]);

/** Kun samme siffer: 0000, 111111 … */
function isRepeated(pin: string): boolean {
  return new Set(pin).size === 1;
}

/** Stigende eller synkende sekvens: 1234, 123456, 4321, 987654 … */
function isSequential(pin: string): boolean {
  let up = true;
  let down = true;
  for (let i = 1; i < pin.length; i++) {
    const diff = Number(pin[i]) - Number(pin[i - 1]);
    if (diff !== 1) up = false;
    if (diff !== -1) down = false;
  }
  return up || down;
}

/**
 * Validerer en PIN som er i ferd med å BLI SATT. Håndheves aldri ved innlogging –
 * eksisterende, kortere PIN-er skal fortsatt virke til brukeren bytter dem
 * (se plan: «ingen bruker skal låses ute ved oppgradering»).
 *
 * @param minLen minste lengde; default følger deployment-varianten.
 * @returns null når PIN-en er OK, ellers en feilmelding til brukeren.
 */
export function validatePin(pin: string, minLen: number = minPinLength()): string | null {
  if (!/^\d+$/.test(pin)) return "PIN kan kun inneholde sifre";
  if (pin.length < minLen) return `PIN må ha minst ${minLen} sifre`;
  if (pin.length > 8) return "PIN kan ha maks 8 sifre";
  if (isRepeated(pin)) return "PIN kan ikke være samme siffer om og om igjen";
  if (isSequential(pin)) return "PIN kan ikke være en tallrekke som 1234 eller 4321";
  if (PIN_BLOCKLIST.has(pin)) return "PIN-en er for vanlig – velg en mindre gjettbar";
  return null;
}

export const registerSchema = z.object({
  nickname: nicknameSchema,
  pin: pinSchema,
  departmentId: z.coerce.number().int().positive(),
  // Valgfritt i skjemaet – kreves kun når REQUIRE_INVITE=1, håndteres i register-ruten.
  inviteCode: z.string().trim().max(40).optional(),
});

export const loginSchema = z.object({
  nickname: z.string().trim().min(1),
  pin: z.string().min(1),
});

export const emailSchema = z.string().trim().toLowerCase().email("Ugyldig e-postadresse");

export const magicRequestSchema = z.object({
  email: emailSchema,
});

export const drinkKeySchema = z.string().trim().min(1).max(40);

// Hosting-henvendelse fra /kom-i-gang-skjemaet (erstatter mailto-lenken).
export const contactRequestSchema = z.object({
  name: z.string().trim().min(2, "Fyll inn navn").max(80),
  company: z.string().trim().min(1, "Fyll inn firma/organisasjon").max(120),
  email: emailSchema,
  message: z.string().trim().max(1000).optional(),
});

export const updateProfileSchema = z.object({
  nickname: nicknameSchema.optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  pin: pinSchema.optional(),
});
