import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Hele app-gruppen krever innlogging.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const t = await getTranslations("Common");

  return (
    <>
      <AppNav nickname={user.nickname} isAdmin={user.isAdmin} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
