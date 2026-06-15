import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return fail("Krever admin", 403);

  const body = (await req.json().catch(() => ({}))) as { name?: string; color?: string };
  const name = (body.name ?? "").trim();
  if (!name) return fail("Mangler navn");

  const slug = slugify(name) || `avd-${Date.now()}`;
  const exists = await prisma.department.findUnique({ where: { slug } });
  if (exists) return fail("Avdeling finnes allerede", 409);

  const dept = await prisma.department.create({
    data: { name, slug, color: body.color?.trim() || "#7c5cff" },
  });
  return ok({ department: dept });
}
