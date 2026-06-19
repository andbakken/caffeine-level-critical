import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Plakat-ruten ligger utenfor (app)-gruppen så den slipper AppNav og app-marginer —
// hele siden er ren A5-utskrift. Kun admin slipper inn.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PosterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/dashboard");

  return <>{children}</>;
}
