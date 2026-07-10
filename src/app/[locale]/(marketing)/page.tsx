import type { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { OfficeScene } from "@/components/OfficeScene";
import { CupCounter } from "@/components/CupCounter";
import { PricingCards } from "@/components/PricingCards";
import { ScreenshotShowcase } from "@/components/ScreenshotShowcase";
import { Testimonials } from "@/components/Testimonials";
import { Link } from "@/i18n/navigation";
import { hostedPrice } from "@/lib/pricing";
import { jsonLdString, marketingMetadata, softwareAppJsonLd } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Feature = {
  icon: string;
  title: string;
  body: string;
  /** Valgfri intern lenke («les mer»-vei) fra kortet, f.eks. /merker. */
  href?: string;
  linkLabel?: string;
};
type Step = { n: string; title: string; body: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });
  return marketingMetadata(locale, "", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default function LandingPage() {
  const t = useTranslations("Landing");
  const locale = useLocale() as Locale;
  const price = hostedPrice(locale);

  const features = t.raw("features") as Feature[];
  const steps = t.raw("steps") as Step[];

  const appJsonLd = softwareAppJsonLd(locale, {
    description: t("metaDescription"),
    selfHosted: t("selfHostedTitle"),
    hosted: t("hostedTitle"),
  });

  return (
    <div className="flex flex-col">
      {/* Strukturerte data: produkt + priser (rich results). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(appJsonLd) }}
      />
      {/* ---- HERO ---- */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 grid lg:grid-cols-2 gap-10 items-center">
        <div className="flex flex-col gap-6">
          <p className="heading text-accent-2 text-xs sm:text-sm tracking-widest uppercase">
            {t("heroEyebrow")}
          </p>
          <h1 className="heading text-gold text-2xl sm:text-4xl leading-relaxed">
            {t("heroTitle")}
          </h1>
          <p className="text-ink-dim text-lg sm:text-xl leading-relaxed">
            {t("heroBody")}
          </p>
          <div className="flex flex-wrap gap-3">
            {/* Primær rett til konvertering; sekundær «se mer»-vei for de nysgjerrige. */}
            <Link
              href="/kom-i-gang"
              className="pixel-btn pixel-btn-gold"
              data-umami-event="cta_hero"
            >
              {t("ctaStart")}
            </Link>
            <Link
              href="/produkt"
              className="pixel-btn pixel-btn-ghost"
              data-umami-event="cta_hero_secondary"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
          <p className="text-ink-dim text-base">
            {t("pricingNote", { price: price.amount, period: price.period })}
          </p>
        </div>

        <OfficeScene />
      </section>

      {/* ---- KOPP-TELLER (social proof) ---- */}
      <CupCounter />

      {/* ---- SKJERMBILDER (vis, ikke fortell) ---- */}
      <ScreenshotShowcase />

      {/* ---- FUNKSJONER ---- */}
      <section id="funksjoner" className="bg-bg-2/50 border-y-[3px] border-line">
        <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col gap-8">
          <h2 className="heading text-accent-2 text-xl text-center">
            {t("featuresHeading")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="pixel-panel feature-card p-5 flex flex-col gap-3">
                <span className="text-4xl feature-icon" aria-hidden>
                  {f.icon}
                </span>
                <h3 className="font-display text-sm text-gold leading-relaxed">
                  {f.title}
                </h3>
                <p className="text-ink-dim text-base leading-relaxed">{f.body}</p>
                {f.href && f.linkLabel && (
                  <Link href={f.href} className="text-accent-2 hover:text-gold text-sm mt-auto">
                    {f.linkLabel}
                  </Link>
                )}
              </div>
            ))}
          </div>
          {/* Intern lenke til produktsiden — bedre crawl-sti og en tydelig «les mer»-vei. */}
          <Link
            href="/produkt#funksjoner"
            className="text-accent-2 hover:text-gold text-center"
          >
            {t("featuresMore")}
          </Link>
        </div>
      </section>

      {/* ---- HVORDAN (quest-path: steg med fotspor mellom) ---- */}
      <section className="max-w-6xl mx-auto px-4 py-14 flex flex-col gap-8">
        <h2 className="heading text-accent-2 text-xl text-center">
          {t("howHeading")}
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-2">
          {steps.map((s, i) => (
            <div key={s.n} className="contents">
              {i > 0 && (
                <span className="quest-sep hidden sm:block shrink-0" aria-hidden>
                  👣
                </span>
              )}
              <div className="pixel-panel scroll-pop p-5 flex flex-col gap-2 flex-1">
                <span className="font-display text-2xl text-gold">{s.n}</span>
                <h3 className="font-display text-sm text-accent-2">{s.title}</h3>
                <p className="text-ink-dim text-base leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- SOSIAL BEVISFØRING (high scores fra pilotkontorene) ---- */}
      <Testimonials />

      {/* ---- PRISER ---- */}
      <section id="priser" className="border-b-[3px] border-line">
        <div className="max-w-5xl mx-auto px-4 py-14 flex flex-col gap-8">
          <h2 className="heading text-accent-2 text-xl text-center">
            {t("pricingHeading")}
          </h2>
          <PricingCards />
        </div>
      </section>

      {/* ---- SLUTT-CTA ---- */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-5">
        <h2 className="heading text-gold text-xl sm:text-2xl leading-relaxed">
          {t("endTitle")}
        </h2>
        <p className="text-ink-dim text-lg max-w-xl">{t("endBody")}</p>
        <Link
          href="/kom-i-gang"
          className="pixel-btn pixel-btn-gold"
          data-umami-event="cta_end"
        >
          {t("ctaStart")}
        </Link>
      </section>
    </div>
  );
}
