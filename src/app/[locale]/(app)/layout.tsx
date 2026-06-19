import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSupportEmail } from "@/lib/support";
import { AppNav } from "@/components/AppNav";

// Innloggede sider skal aldri indekseres.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Hele app-gruppen krever innlogging.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <AppNav
        nickname={user.nickname}
        isAdmin={user.isAdmin}
        supportEmail={getSupportEmail()}
      />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
