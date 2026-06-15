import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="py-8">
      <Suspense fallback={<p className="text-center">Laster…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
