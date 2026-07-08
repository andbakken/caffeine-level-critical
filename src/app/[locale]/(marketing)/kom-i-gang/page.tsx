import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CONTACT_EMAIL } from "@/lib/brand";
import { marketingMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return marketingMetadata(locale, "kom-i-gang", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default function GetStartedPage() {
  const t = useTranslations("Contact");

  // Selvbetjent kjøp (Stripe) er parkert til det er satt opp for prod. Inntil da
  // sender vi hosting-henvendelser via e-post og setter opp instansen manuelt.
  const mailto =
    `mailto:${CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent(t("emailSubject"))}` +
    `&body=${encodeURIComponent(t("emailBody"))}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 flex flex-col gap-6">
      <div className="pixel-panel p-6 flex flex-col gap-4">
        <h1 className="heading text-gold text-xl">{t("title")}</h1>
        <p className="text-ink-dim text-base leading-relaxed">{t("intro")}</p>

        <a href={mailto} className="pixel-btn pixel-btn-gold mt-2">
          {t("emailCta")}
        </a>
        <p className="text-ink-dim text-sm text-center break-all">{CONTACT_EMAIL}</p>

        <p className="text-ink-dim text-sm leading-relaxed border-t border-line/60 pt-3">
          {t("responseNote")}
        </p>
      </div>

      <div className="pixel-panel p-6 flex flex-col gap-3">
        <p className="text-ink-dim text-base leading-relaxed">{t("selfHostAlt")}</p>
        <Link href="/last-ned" className="pixel-btn pixel-btn-ghost self-start">
          {t("selfHostCta")}
        </Link>
      </div>
    </div>
  );
}
