import type { Metadata } from "next";
import { useLocale, useTranslations } from "next-intl";
import { LegalArticle } from "@/components/LegalArticle";
import { legal } from "@/content/legal";
import { marketingMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = legal[locale].personvern;
  return marketingMetadata(locale, "personvern", { title: doc.title, description: doc.metaDescription });
}

export default function PrivacyPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("Common");
  return <LegalArticle doc={legal[locale].personvern} updatedLabel={t("legal.updated")} />;
}
