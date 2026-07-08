import Script from "next/script";
import { useTranslations } from "next-intl";
import { MarketingNav } from "@/components/MarketingNav";
import { Link } from "@/i18n/navigation";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = useTranslations("Common");
  // Salgslenkene skjules på både hostet tenant (IS_TENANT=1) og selvhost (SELF_HOST=1)
  // – da vises kun innlogging. De juridiske sidene (footer) gjelder kun vår hostede
  // tjeneste, så de skjules på selvhost, men beholdes på tenant.
  const hideSales = process.env.IS_TENANT === "1" || process.env.SELF_HOST === "1";
  const hideLegal = process.env.SELF_HOST === "1";
  // Anonym web-analyse (Umami). Runtime-env, satt KUN på apex/marketing-instansen –
  // aldri på tenant/selvhost, og tom ellers (da lastes ingen sporing).
  const umamiSrc = process.env.UMAMI_SRC;
  const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID;

  return (
    <>
      {!hideSales && umamiSrc && umamiWebsiteId && (
        <Script defer src={umamiSrc} data-website-id={umamiWebsiteId} />
      )}
      <MarketingNav hideSales={hideSales} />

      <main className="flex-1 w-full">{children}</main>

      <footer className="border-t-[3px] border-line bg-bg-2/60">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4 text-ink-dim text-base">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="heading text-gold text-base">☕ {t("brandFull")}</span>
            <span>{t("footer.tagline")}</span>
            <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
          </div>
          {!hideLegal && (
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-line/60 pt-4 text-sm">
              <Link href="/vilkar" className="hover:text-gold">{t("footer.terms")}</Link>
              <Link href="/personvern" className="hover:text-gold">{t("footer.privacy")}</Link>
              <Link href="/databehandleravtale" className="hover:text-gold">{t("footer.dpa")}</Link>
            </nav>
          )}
        </div>
      </footer>
    </>
  );
}
