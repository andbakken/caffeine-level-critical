import path from "node:path";
import { writeFile, unlink } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_AVATAR_BYTES,
  UPLOAD_DIR,
  ensureUploadDir,
} from "@/lib/uploads";
import { fail, ok } from "@/lib/http";
import { isPresetPath } from "@/lib/avatars";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Du må være innlogget", 401);

  const form = await req.formData();
  const file = form.get("avatar");
  if (!(file instanceof File)) return fail("Mangler bilde");

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) return fail("Kun PNG, JPG, WEBP eller GIF");
  if (file.size > MAX_AVATAR_BYTES) return fail("Bildet er for stort (maks 2 MB)");

  await ensureUploadDir();
  const filename = `u${user.id}-${randomBytes(6).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  // rydd opp gammelt OPPLASTET bilde (preset-er har ingen fil på disk)
  if (user.avatarPath && !isPresetPath(user.avatarPath)) {
    try {
      await unlink(path.join(UPLOAD_DIR, user.avatarPath));
    } catch {
      /* ignorer */
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { avatarPath: filename } });
  return ok({ avatarPath: filename });
}
