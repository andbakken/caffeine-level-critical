import type { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { OfficeScene } from "@/components/OfficeScene";
import { hostedPrice } from "@/lib/pricing";
import { marketingMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Feature = { icon: string; title: string; body: string };
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
  const selfHostedBullets = t.raw("selfHostedBullets") as string[];
  const hostedBullets = t.raw("hostedBullets") as string[];

  return (
    <div className="flex flex-col">
      {/* ---- HERO ---- */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 grid lg:grid-cols-2 gap-10 items-center">
        <div className="flex flex-col gap-6">
          <h1 className="heading text-gold text-2xl sm:text-4xl leading-relaxed">
            {t("heroTitle")}
          </h1>
          <p className="text-ink-dim text-lg sm:text-xl leading-relaxed">
            {t("heroBody")}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#priser" className="pixel-btn pixel-btn-gold">
              {t("ctaStart")}
            </a>
          </div>
          <p className="text-ink-dim text-base">
            {t("pricingNote", { price: price.amount, period: price.period })}
          </p>
        </div>

        <OfficeScene />
      </section>

      {/* ---- FUNKSJONER ---- */}
      <section id="funksjoner" className="bg-bg-2/50 border-y-[3px] border-line">
        <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col gap-8">
          <h2 className="heading text-accent-2 text-xl text-center">
            {t("featuresHeading")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="pixel-panel p-5 flex flex-col gap-3">
                <span className="text-4xl">{f.icon}</span>
                <h3 className="font-display text-sm text-gold leading-relaxed">
                  {f.title}
                </h3>
                <p className="text-ink-dim text-base leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- HVORDAN ---- */}
      <section className="max-w-6xl mx-auto px-4 py-14 flex flex-col gap-8">
        <h2 className="heading text-accent-2 text-xl text-center">
          {t("howHeading")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="pixel-panel p-5 flex flex-col gap-2">
              <span className="font-display text-2xl text-gold">{s.n}</span>
              <h3 className="font-display text-sm text-accent-2">{s.title}</h3>
              <p className="text-ink-dim text-base leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- PRISER ---- */}
      <section id="priser" className="bg-bg-2/50 border-y-[3px] border-line">
        <div className="max-w-5xl mx-auto px-4 py-14 flex flex-col gap-8">
          <h2 className="heading text-accent-2 text-xl text-center">
            {t("pricingHeading")}
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {/* Selvhostet */}
            <div className="pixel-panel p-6 flex flex-col gap-4">
              <h3 className="font-display text-sm text-gold">{t("selfHostedTitle")}</h3>
              <div className="font-display text-3xl text-ink">{t("free")}</div>
              <p className="text-ink-dim text-base">{t("selfHostedBody")}</p>
              <ul className="flex flex-col gap-2 text-base">
                {selfHostedBullets.map((b) => (
                  <Li key={b}>{b}</Li>
                ))}
              </ul>
              <a href="#" className="pixel-btn pixel-btn-ghost mt-auto">
                {t("downloadDocker")}
              </a>
            </div>

            {/* Hostet */}
            <div className="pixel-panel p-6 flex flex-col gap-4 relative" style={{ borderColor: "var(--color-gold)" }}>
              <span className="absolute -top-3 right-4 font-display text-[0.6rem] bg-gold text-[#3a2a00] px-2 py-1">
                {t("recommended")}
              </span>
              <h3 className="font-display text-sm text-gold">{t("hostedTitle")}</h3>
              <div className="font-display text-3xl text-ink">
                {price.amount}
                <span className="text-lg text-ink-dim">{price.period}</span>
              </div>
              <p className="text-ink-dim text-base">{t("hostedBody")}</p>
              <ul className="flex flex-col gap-2 text-base">
                {hostedBullets.map((b) => (
                  <Li key={b}>{b}</Li>
                ))}
              </ul>
              <a href="#" className="pixel-btn pixel-btn-gold mt-auto">
                {t("startTrial")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- SLUTT-CTA ---- */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-5">
        <h2 className="heading text-gold text-xl sm:text-2xl leading-relaxed">
          {t("endTitle")}
        </h2>
        <p className="text-ink-dim text-lg max-w-xl">{t("endBody")}</p>
        <a href="#priser" className="pixel-btn pixel-btn-gold">
          {t("ctaStart")}
        </a>
      </section>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-ink">
      <span className="text-accent-2">✔</span>
      <span className="text-ink-dim">{children}</span>
    </li>
  );
}
