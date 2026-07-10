import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ContactForm } from "@/components/ContactForm";
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

// Selvbetjent kjøp (Stripe) er parkert til det er satt opp for prod. Inntil da
// samler skjemaet inn hosting-henvendelser (navn/firma/e-post) som sendes oss på
// e-post via /api/contact — vi setter opp instansen manuelt. E-postadressen står
// igjen som fallback for dem som heller vil skrive selv.
export default function GetStartedPage() {
  const t = useTranslations("Contact");

  return (
    <div className="max-w-xl mx-auto px-4 py-12 flex flex-col gap-6">
      <div className="pixel-panel p-6 flex flex-col gap-4">
        <h1 className="heading text-gold text-xl">{t("title")}</h1>
        <p className="text-ink-dim text-base leading-relaxed">{t("intro")}</p>

        <ContactForm />

        <p className="text-ink-dim text-sm leading-relaxed border-t border-line/60 pt-3">
          {t("responseNote")}{" "}
          {t("orEmail")}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-2 break-all">
            {CONTACT_EMAIL}
          </a>
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
