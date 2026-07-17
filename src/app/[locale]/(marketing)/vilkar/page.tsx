import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LegalArticle } from "@/components/LegalArticle";
import { hasLegalIdentity, legal } from "@/content/legal";
import { marketingMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = legal[locale].vilkar;
  return marketingMetadata(locale, "vilkar", { title: doc.title, description: doc.metaDescription });
}

export default function TermsPage() {
  // Uten LEGAL_*-env (selvhost, eller apex feilkonfigurert) finnes ingen leverandør
  // å vise vilkår for. SELF_HOST=1 fanger dette først, dette er andre linje.
  if (!hasLegalIdentity) notFound();
  const locale = useLocale() as Locale;
  const t = useTranslations("Common");
  return <LegalArticle doc={legal[locale].vilkar} updatedLabel={t("legal.updated")} />;
}
