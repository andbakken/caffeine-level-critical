import { prisma } from "@/lib/db";
import { createSession, hashPin } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { fail, ok } from "@/lib/http";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Ugyldig forespørsel");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Ugyldige data");
  }
  const { nickname, pin, departmentId } = parsed.data;

  const dept = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!dept) return fail("Ukjent avdeling");

  const existing = await prisma.user.findUnique({ where: { nickname } });
  if (existing) return fail("Kallenavnet er allerede tatt", 409);

  const user = await prisma.user.create({
    data: { nickname, pinHash: hashPin(pin), departmentId },
  });

  await createSession(user.id);
  return ok({ user: { id: user.id, nickname: user.nickname } });
}
