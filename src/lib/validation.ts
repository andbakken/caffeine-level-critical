import { z } from "zod";

export const nicknameSchema = z
  .string()
  .trim()
  .min(2, "Kallenavn må ha minst 2 tegn")
  .max(20, "Kallenavn kan ha maks 20 tegn")
  .regex(/^[\p{L}0-9 _\-]+$/u, "Kun bokstaver, tall, mellomrom, _ og -");

export const pinSchema = z
  .string()
  .regex(/^\d{4,8}$/, "PIN må være 4–8 sifre");

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
