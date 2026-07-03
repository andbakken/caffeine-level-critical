import { useTranslations } from "next-intl";
import { MarketingNav } from "@/components/MarketingNav";
import { Link } from "@/i18n/navigation";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = useTranslations("Common");
  // På kunde-instanser (IS_TENANT=1) vises kun innlogging – ikke salgslenkene.
  const isTenant = process.env.IS_TENANT === "1";

  return (
    <>
      <MarketingNav isTenant={isTenant} />

      <main className="flex-1 w-full">{children}</main>

      <footer className="border-t-[3px] border-line bg-bg-2/60">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4 text-ink-dim text-base">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="heading text-gold text-base">☕ {t("brandFull")}</span>
            <span>{t("footer.tagline")}</span>
            <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-line/60 pt-4 text-sm">
            <Link href="/vilkar" className="hover:text-gold">{t("footer.terms")}</Link>
            <Link href="/personvern" className="hover:text-gold">{t("footer.privacy")}</Link>
            <Link href="/databehandleravtale" className="hover:text-gold">{t("footer.dpa")}</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
