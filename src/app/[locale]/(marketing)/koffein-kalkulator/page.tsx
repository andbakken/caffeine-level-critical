import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CaffeineCalculator } from "@/components/CaffeineCalculator";
import { calculate, clampInput } from "@/lib/caffeine";
import { marketingMetadata, siteUrl } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

// Koffeinkalkulatoren — gratis pixel-miniapp og lenkemagnet: «hvor mye koffein
// har kontoret ditt i blodet akkurat nå?» Delte lenker (?k=&c=&t=&kk=) får eget
// OG-kort fra /api/og/kalkulator så resultatet vises i sosiale medier.

type Search = { k?: string; c?: string; t?: string; kk?: string };

function inputFrom(sp: Search) {
  return clampInput({ people: sp.k, coffee: sp.c, tea: sp.t, cocoa: sp.kk });
}

function hasShared(sp: Search) {
  return sp.k !== undefined || sp.c !== undefined;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "Calculator" });

  const meta = marketingMetadata(locale, "koffein-kalkulator", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });

  // Delt resultat: personlig tittel + dynamisk OG-kort i stedet for standardbildet.
  if (hasShared(sp)) {
    const input = inputFrom(sp);
    const r = calculate(input);
    const total = r.total.toLocaleString("nb-NO");
    const og = new URLSearchParams({
      total: String(r.total),
      level: r.level,
      locale,
    });
    const title = t("sharedTitle", { total });
    return {
      ...meta,
      title,
      openGraph: {
        ...meta.openGraph,
        title,
        images: [{ url: `${siteUrl}/api/og/kalkulator?${og}`, width: 1200, height: 630 }],
      },
      twitter: { ...meta.twitter, title },
    };
  }
  return meta;
}

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  return <CalculatorContent initial={inputFrom(sp)} />;
}

function CalculatorContent({ initial }: { initial: ReturnType<typeof inputFrom> }) {
  const t = useTranslations("Calculator");
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8 w-full">
      <header className="text-center flex flex-col items-center gap-4">
        <p className="heading text-accent-2 text-xs sm:text-sm tracking-widest uppercase">
          ☕ {t("eyebrow")}
        </p>
        <h1 className="heading text-gold text-2xl sm:text-3xl leading-relaxed">{t("title")}</h1>
        <p className="text-ink-dim text-lg max-w-xl leading-relaxed">{t("intro")}</p>
      </header>

      <CaffeineCalculator initial={initial} />

      <p className="text-ink-dim text-xs text-center leading-relaxed">{t("disclaimer")}</p>

      <div className="pixel-panel p-6 text-center flex flex-col items-center gap-3">
        <p className="text-ink-dim text-base leading-relaxed max-w-md">{t("pitch")}</p>
        <Link
          href="/kom-i-gang"
          className="pixel-btn pixel-btn-gold"
          data-umami-event="cta_calculator"
        >
          {t("pitchCta")}
        </Link>
      </div>
    </div>
  );
}
