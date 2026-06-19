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
import { ORG_PROFILE_ID } from "@/lib/orgProfile";

// Last opp bedriftens logo til plakatene. Gjenbruker samme bilde-/størrelsesregler
// som avatarer (PNG/JPG/WEBP/GIF, maks 2 MB).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);

  const form = await req.formData();
  const file = form.get("logo");
  if (!(file instanceof File)) return fail("Mangler bilde");

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) return fail("Kun PNG, JPG, WEBP eller GIF");
  if (file.size > MAX_AVATAR_BYTES) return fail("Bildet er for stort (maks 2 MB)");

  await ensureUploadDir();
  const filename = `logo-${randomBytes(6).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  const existing = await prisma.orgProfile.findUnique({
    where: { id: ORG_PROFILE_ID },
    select: { logoPath: true },
  });

  const profile = await prisma.orgProfile.upsert({
    where: { id: ORG_PROFILE_ID },
    create: { id: ORG_PROFILE_ID, logoPath: filename },
    update: { logoPath: filename },
    select: { logoPath: true },
  });

  // Rydd opp den gamle logofilen (om noen) etter at den nye er lagret.
  if (existing?.logoPath && existing.logoPath !== filename) {
    try {
      await unlink(path.join(UPLOAD_DIR, existing.logoPath));
    } catch {
      /* ignorer */
    }
  }

  return ok({ logoPath: profile.logoPath });
}
