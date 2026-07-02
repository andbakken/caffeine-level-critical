import type { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { hostedPrice } from "@/lib/pricing";
import { marketingMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Detail = { icon: string; title: string; body: string };
type Faq = { q: string; a: string };
type Row = { label: string; self: string; hosted: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Product" });
  return marketingMetadata(locale, "produkt", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default function ProductPage() {
  const t = useTranslations("Product");
  const locale = useLocale() as Locale;
  const price = hostedPrice(locale);

  const details = t.raw("details") as Detail[];
  const faq = t.raw("faq") as Faq[];
  const rows = t.raw("compareRows") as Row[];
  const hosting = t.raw("hostingBullets") as Detail[];

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8 text-center flex flex-col items-center gap-5">
        <p className="heading text-accent-2 text-xs sm:text-sm tracking-widest uppercase">
          {t("heroEyebrow")}
        </p>
        <h1 className="heading text-gold text-2xl sm:text-4xl leading-relaxed">
          {t("heroTitle")}
        </h1>
        <p className="text-ink-dim text-lg sm:text-xl max-w-2xl leading-relaxed">
          {t("heroBody")}
        </p>
      </section>

      {/* FUNKSJONER */}
      <section className="bg-bg-2/50 border-y-[3px] border-line">
        <div className="max-w-6xl mx-auto px-4 py-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {details.map((d) => (
            <div key={d.title} className="pixel-panel p-5 flex flex-col gap-3">
              <span className="text-4xl">{d.icon}</span>
              <h3 className="font-display text-sm text-gold leading-relaxed">{d.title}</h3>
              <p className="text-ink-dim text-base leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NFC-FORKLARING */}
      <section className="max-w-5xl mx-auto px-4 py-14 flex flex-col gap-6">
        <h2 className="heading text-accent-2 text-xl text-center">{t("nfcHeading")}</h2>
        <p className="text-ink-dim text-lg text-center max-w-3xl mx-auto leading-relaxed">
          {t("nfcIntro")}
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="pixel-panel p-6 flex flex-col gap-3">
            <h3 className="font-display text-sm text-gold">{t("selfHosted")}</h3>
            <p className="text-ink-dim text-base leading-relaxed">{t("nfcSelfBody")}</p>
            <code className="bg-[#100d22] border-[3px] border-line px-3 py-2 text-base break-all">
              http://caffeine-level-critical.lokal/t/&lt;token&gt;
            </code>
          </div>
          <div className="pixel-panel p-6 flex flex-col gap-3" style={{ borderColor: "var(--color-gold)" }}>
            <h3 className="font-display text-sm text-gold">{t("hosted")}</h3>
            <p className="text-ink-dim text-base leading-relaxed">{t("nfcHostedBody")}</p>
            <code className="bg-[#100d22] border-[3px] border-line px-3 py-2 text-base break-all">
              https://app.caffeine-level-critical.no/t/&lt;token&gt;
            </code>
          </div>
        </div>
        <p className="text-ink-dim text-base text-center max-w-3xl mx-auto leading-relaxed">
          {t("nfcFootnote")}
        </p>
      </section>

      {/* SAMMENLIGNING */}
      <section className="bg-bg-2/50 border-y-[3px] border-line">
        <div className="max-w-4xl mx-auto px-4 py-14 flex flex-col gap-8">
          <h2 className="heading text-accent-2 text-xl text-center">{t("compareHeading")}</h2>
          <div className="pixel-panel overflow-hidden">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b-[3px] border-line bg-panel-2/60">
                  <th className="text-left p-3 font-display text-sm">&nbsp;</th>
                  <th className="p-3 font-display text-sm text-ink">{t("selfHosted")}</th>
                  <th className="p-3 font-display text-sm text-gold">{t("hosted")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line/60">
                  <td className="p-3 text-ink-dim">{t("priceLabel")}</td>
                  <td className="p-3 text-center">{t("free")}</td>
                  <td className="p-3 text-center text-gold">{`${price.amount}${price.period}`}</td>
                </tr>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-line/60 last:border-0">
                    <td className="p-3 text-ink-dim">{row.label}</td>
                    <td className="p-3 text-center">{row.self}</td>
                    <td className="p-3 text-center text-gold">{row.hosted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* RAMMENE FOR HOSTINGEN */}
      <section className="max-w-6xl mx-auto px-4 py-14 flex flex-col gap-8 w-full">
        <h2 className="heading text-accent-2 text-xl text-center">{t("hostingHeading")}</h2>
        <p className="text-ink-dim text-lg text-center max-w-3xl mx-auto leading-relaxed">
          {t("hostingIntro")}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hosting.map((h) => (
            <div key={h.title} className="pixel-panel p-5 flex flex-col gap-3">
              <span className="text-4xl">{h.icon}</span>
              <h3 className="font-display text-sm text-gold leading-relaxed">{h.title}</h3>
              <p className="text-ink-dim text-base leading-relaxed">{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRISER */}
      <section id="priser" className="max-w-5xl mx-auto px-4 py-14 flex flex-col gap-8 w-full">
        <h2 className="heading text-accent-2 text-xl text-center">{t("pricingHeading")}</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="pixel-panel p-6 flex flex-col gap-4">
            <h3 className="font-display text-sm text-gold">{t("selfHosted")}</h3>
            <div className="font-display text-3xl text-ink">{t("free")}</div>
            <p className="text-ink-dim text-base">{t("selfHostedDesc")}</p>
            <Link href="/last-ned" className="pixel-btn pixel-btn-ghost mt-auto">
              {t("installButton")}
            </Link>
          </div>
          <div className="pixel-panel p-6 flex flex-col gap-4 relative" style={{ borderColor: "var(--color-gold)" }}>
            <span className="absolute -top-3 right-4 font-display text-[0.6rem] bg-gold text-[#3a2a00] px-2 py-1">
              {t("recommended")}
            </span>
            <h3 className="font-display text-sm text-gold">{t("hosted")}</h3>
            <div className="font-display text-3xl text-ink">
              {price.amount}
              <span className="text-lg text-ink-dim">{price.period}</span>
            </div>
            <p className="text-ink-dim text-base">{t("hostedDesc")}</p>
            <Link href="/kom-i-gang" className="pixel-btn pixel-btn-gold mt-auto">
              {t("startTrial")}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-bg-2/50 border-t-[3px] border-line">
        <div className="max-w-3xl mx-auto px-4 py-14 flex flex-col gap-6">
          <h2 className="heading text-accent-2 text-xl text-center">{t("faqHeading")}</h2>
          <div className="flex flex-col gap-3">
            {faq.map((f) => (
              <div key={f.q} className="pixel-panel p-5 flex flex-col gap-2">
                <h3 className="font-display text-sm text-gold leading-relaxed">{f.q}</h3>
                <p className="text-ink-dim text-base leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
