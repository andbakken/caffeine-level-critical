import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { ORG_PROFILE_ID } from "@/lib/orgProfile";

// Maks tegn på plakat-tekstene – holder utskriften lesbar og hindrer overflow.
const MAX_HEADING = 80;
const MAX_BODY = 280;

// Tom streng lagres som null så plakaten faller tilbake på den lokaliserte defaulten.
function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);

  const body = (await req.json().catch(() => ({}))) as {
    posterHeading?: unknown;
    posterBody?: unknown;
  };

  const data = {
    posterHeading: clean(body.posterHeading, MAX_HEADING),
    posterBody: clean(body.posterBody, MAX_BODY),
  };

  const profile = await prisma.orgProfile.upsert({
    where: { id: ORG_PROFILE_ID },
    create: { id: ORG_PROFILE_ID, ...data },
    update: data,
    select: { posterHeading: true, posterBody: true },
  });
  return ok({ profile });
}
