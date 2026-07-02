import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { isInviteRequired, getInviteCode, rotateInviteCode } from "@/lib/orgProfile";

// Invitasjonskode-administrasjon (kun admin, kun relevant når REQUIRE_INVITE=1).
// GET: les gjeldende kode. POST: generer en ny (gammel slutter å virke umiddelbart).

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);
  if (!isInviteRequired()) return ok({ enabled: false, code: null });
  return ok({ enabled: true, code: await getInviteCode() });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);
  if (!isInviteRequired()) return fail("Invitasjonskode er ikke i bruk her", 400);
  const code = await rotateInviteCode();
  return ok({ enabled: true, code });
}
