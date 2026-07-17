import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { OnboardingForm } from "@/components/OnboardingForm";
import { marketingMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Onboarding" });
  return marketingMetadata(locale, "kom-i-gang", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

// Selvbetjent kjøp: skjemaet oppretter en Stripe Checkout-sesjon via /api/checkout
// (→ control-plane), som provisjonerer instansen på webhook. 14 dagers prøveperiode
// settes i control-plane (TRIAL_DAYS) – copyen her må stemme med den.
export default function GetStartedPage() {
  const t = useTranslations("Onboarding");

  return (
    <div className="max-w-xl mx-auto px-4 py-12 flex flex-col gap-6">
      {/* «Installer selv»-veien først: den gratise selvhostingen er hovedproduktet,
          hosting er alternativet for dem som heller vil at vi drifter. */}
      <div className="pixel-panel p-6 flex flex-col gap-3">
        <p className="text-ink-dim text-base leading-relaxed">{t("selfHostAlt")}</p>
        <Link href="/last-ned" className="pixel-btn pixel-btn-ghost self-start">
          {t("selfHostCta")}
        </Link>
      </div>

      <OnboardingForm />
    </div>
  );
}
