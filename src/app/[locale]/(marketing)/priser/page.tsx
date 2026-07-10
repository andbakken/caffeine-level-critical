import type { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PricingCards } from "@/components/PricingCards";
import { jsonLdString, marketingMetadata, softwareAppJsonLd } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

// Dedikert prisside: gir søkeordet «priser» en egen URL (nav-lenken pekte før på
// /produkt#priser), og gir en renere konverterings-trakt å måle i Umami.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  return marketingMetadata(locale, "priser", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default function PricingPage() {
  const t = useTranslations("Pricing");
  const tl = useTranslations("Landing");
  const locale = useLocale() as Locale;

  const appJsonLd = softwareAppJsonLd(locale, {
    description: t("metaDescription"),
    selfHosted: tl("selfHostedTitle"),
    hosted: tl("hostedTitle"),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-10">
      {/* Strukturerte data: produkt + priser (rich results). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(appJsonLd) }}
      />

      <header className="text-center flex flex-col items-center gap-4">
        <h1 className="heading text-gold text-2xl sm:text-3xl leading-relaxed">
          {t("title")}
        </h1>
        <p className="text-ink-dim text-lg max-w-2xl leading-relaxed">{t("intro")}</p>
      </header>

      <PricingCards />

      <p className="text-ink-dim text-base text-center">
        {t("compareNote")}{" "}
        <Link href="/produkt" className="text-accent-2 hover:text-gold">
          {t("compareLink")}
        </Link>
      </p>
    </div>
  );
}
