import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { marketingMetadata } from "@/lib/seo";
import { getSupportEmail } from "@/lib/support";
import type { Locale } from "@/i18n/routing";

// Kvitteringsside etter Stripe Checkout (success_url i control-plane peker hit).
// Bevisst statisk: vi leser IKKE session_id eller snakker med Stripe herfra –
// selve provisjoneringen skjer via webhook, og admin får en e-post når instansen
// er klar. Siden holdes ute av sitemap.ts (den er en kvittering, ikke en landingsside).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Welcome" });
  return marketingMetadata(locale, "velkommen", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default function WelcomePage() {
  const t = useTranslations("Welcome");
  const support = getSupportEmail();
  const steps = t.raw("steps") as string[];

  return (
    <div className="py-10">
      <div className="pixel-panel p-6 sm:p-8 max-w-xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-center">
          <span className="text-5xl">☕</span>
          <h1 className="heading text-gold text-xl sm:text-2xl leading-relaxed">
            {t("title")}
          </h1>
          <p className="text-ink-dim text-lg leading-relaxed">{t("intro")}</p>
        </div>

        <div className="border-t border-line/60 pt-5 flex flex-col gap-3">
          <h2 className="font-display text-sm text-accent-2">{t("nextHeading")}</h2>
          <ol className="flex flex-col gap-2 text-base">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-2 text-ink">
                <span className="font-display text-gold">{i + 1}.</span>
                <span className="text-ink-dim">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-ink-dim text-sm leading-relaxed border-t border-line/60 pt-4">
          {t("spamNote")}
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/produkt" className="pixel-btn pixel-btn-ghost">
            {t("learnMore")}
          </Link>
          {support && (
            <a href={`mailto:${support}`} className="pixel-btn pixel-btn-ghost">
              {t("contactSupport")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
