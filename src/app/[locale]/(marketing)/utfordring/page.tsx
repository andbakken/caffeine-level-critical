import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChallengeMaker } from "@/components/ChallengeMaker";
import { cleanName } from "@/lib/challenge";
import { marketingMetadata, siteUrl } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

// «Utfordre kontoret»: delbart kort («Regnskap utfordrer Utvikling ☕⚔️») med
// dynamisk OG-bilde fra /api/og/utfordring. Ingen lagring — utfordringen bor i URL-en.

type Search = { fra?: string; til?: string };

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "Challenge" });

  const meta = marketingMetadata(locale, "utfordring", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });

  const from = cleanName(sp.fra);
  const to = cleanName(sp.til);
  if (from && to) {
    const og = new URLSearchParams({ fra: from, til: to, locale });
    const title = t("card", { from, to });
    return {
      ...meta,
      title,
      openGraph: {
        ...meta.openGraph,
        title,
        images: [{ url: `${siteUrl}/api/og/utfordring?${og}`, width: 1200, height: 630 }],
      },
      twitter: { ...meta.twitter, title },
    };
  }
  return meta;
}

export default async function ChallengePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  return <ChallengeContent initialFrom={cleanName(sp.fra)} initialTo={cleanName(sp.til)} />;
}

function ChallengeContent({
  initialFrom,
  initialTo,
}: {
  initialFrom: string;
  initialTo: string;
}) {
  const t = useTranslations("Challenge");
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8 w-full">
      <header className="text-center flex flex-col items-center gap-4">
        <p className="heading text-accent-2 text-xs sm:text-sm tracking-widest uppercase">
          ⚔️ {t("eyebrow")}
        </p>
        <h1 className="heading text-gold text-2xl sm:text-3xl leading-relaxed">{t("title")}</h1>
        <p className="text-ink-dim text-lg max-w-xl leading-relaxed">{t("intro")}</p>
      </header>

      <ChallengeMaker initialFrom={initialFrom} initialTo={initialTo} />

      <div className="pixel-panel p-6 text-center flex flex-col items-center gap-3">
        <p className="text-ink-dim text-base leading-relaxed max-w-md">{t("pitch")}</p>
        <Link
          href="/kom-i-gang"
          className="pixel-btn pixel-btn-gold"
          data-umami-event="cta_challenge"
        >
          {t("pitchCta")}
        </Link>
      </div>
    </div>
  );
}
