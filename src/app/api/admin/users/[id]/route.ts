import { prisma } from "@/lib/db";
import { getCurrentUser, hashPin } from "@/lib/auth";
import { nicknameSchema, validatePin } from "@/lib/validation";
import { fail, ok } from "@/lib/http";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin?.isAdmin) return fail("Krever admin", 403);

  const id = Number((await ctx.params).id);
  if (!id) return fail("Ugyldig id");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return fail("Bruker finnes ikke", 404);

  const body = (await req.json().catch(() => ({}))) as {
    nickname?: string;
    departmentId?: number;
    isActive?: boolean;
    isAdmin?: boolean;
    pin?: string;
  };

  const data: {
    nickname?: string;
    departmentId?: number;
    isActive?: boolean;
    isAdmin?: boolean;
    pinHash?: string;
  } = {};

  // --- Kallenavn ---
  if (body.nickname != null) {
    const parsed = nicknameSchema.safeParse(body.nickname);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Ugyldig kallenavn");
    if (parsed.data !== target.nickname) {
      const taken = await prisma.user.findUnique({ where: { nickname: parsed.data } });
      if (taken) return fail("Kallenavnet er allerede tatt", 409);
      data.nickname = parsed.data;
    }
  }

  // --- Avdeling ---
  if (body.departmentId != null) {
    const dept = await prisma.department.findUnique({ where: { id: Number(body.departmentId) } });
    if (!dept) return fail("Ukjent avdeling");
    data.departmentId = dept.id;
  }

  // --- PIN-reset ---
  // Samme styrkekrav som når brukeren setter PIN selv – ellers ville admin-reset
  // vært en vei rundt kravet, og en resatt PIN er nettopp den som deles muntlig.
  if (body.pin != null) {
    if (typeof body.pin !== "string") return fail("Ugyldig PIN");
    const pinError = validatePin(body.pin);
    if (pinError) return fail(pinError);
    data.pinHash = hashPin(body.pin);
  }

  // --- Aktiv-status ---
  if (body.isActive != null) data.isActive = Boolean(body.isActive);

  // --- Admin-status ---
  if (body.isAdmin != null) data.isAdmin = Boolean(body.isAdmin);

  // --- Vern mot å låse seg selv ute / fjerne siste admin ---
  const deactivating = data.isActive === false && target.isActive;
  const demoting = data.isAdmin === false && target.isAdmin;

  if (target.id === admin.id && (deactivating || demoting)) {
    return fail("Du kan ikke deaktivere eller fjerne admin fra deg selv");
  }

  if (target.isAdmin && (demoting || deactivating)) {
    const activeAdmins = await prisma.user.count({ where: { isAdmin: true, isActive: true } });
    if (activeAdmins <= 1) {
      return fail("Kan ikke fjerne den siste aktive administratoren");
    }
  }

  if (Object.keys(data).length === 0) return ok({ unchanged: true });

  const updated = await prisma.user.update({ where: { id }, data });

  // Deaktivering bør også logge brukeren ut (ugyldiggjør økter).
  if (data.isActive === false) {
    await prisma.session.deleteMany({ where: { userId: id } });
  }

  return ok({ user: { id: updated.id } });
}
