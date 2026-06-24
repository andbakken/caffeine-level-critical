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

export const updateProfileSchema = z.object({
  nickname: nicknameSchema.optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  pin: pinSchema.optional(),
});
