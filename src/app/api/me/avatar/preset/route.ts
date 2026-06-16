import path from "node:path";
import { unlink } from "node:fs/promises";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/uploads";
import { fail, ok } from "@/lib/http";
import { PRESET_PREFIX, isPresetPath, isValidPreset } from "@/lib/avatars";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Du må være innlogget", 401);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const preset = String(body.preset ?? "").trim();
  if (!isValidPreset(preset)) return fail("Ukjent profilbilde");

  // Rydd opp et eventuelt tidligere OPPLASTET bilde (preset-er har ingen fil på disk).
  if (user.avatarPath && !isPresetPath(user.avatarPath)) {
    try {
      await unlink(path.join(UPLOAD_DIR, user.avatarPath));
    } catch {
      /* ignorer */
    }
  }

  const avatarPath = `${PRESET_PREFIX}${preset}`;
  await prisma.user.update({ where: { id: user.id }, data: { avatarPath } });
  return ok({ avatarPath });
}
