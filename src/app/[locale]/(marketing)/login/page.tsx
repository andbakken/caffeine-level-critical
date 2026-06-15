import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const t = await getTranslations("Auth");

  return (
    <div className="py-8">
      <Suspense fallback={<p className="text-center">{t("loading")}</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
