import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = useTranslations("Common");

  return (
    <>
      <header className="border-b-[3px] border-line bg-bg-2/80 backdrop-blur sticky top-0 z-40">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <Link href="/landing" className="heading text-gold text-lg sm:text-xl">
            ☕ {t("brand")}
          </Link>
          <div className="flex items-center gap-3 sm:gap-5 text-base sm:text-lg">
            <Link href="/produkt" className="hover:text-accent-2">
              {t("nav.produkt")}
            </Link>
            <Link href="/last-ned" className="hover:text-accent-2">
              {t("nav.lastNed")}
            </Link>
            <Link href="/produkt#priser" className="hover:text-accent-2">
              {t("nav.priser")}
            </Link>
            <Link href="/" className="hover:text-accent-2">
              {t("nav.loggInn")}
            </Link>
            <Link href="/produkt#priser" className="pixel-btn !py-2 !px-3">
              {t("nav.komIGang")}
            </Link>
            <LocaleSwitcher />
          </div>
        </nav>
      </header>

      <main className="flex-1 w-full">{children}</main>

      <footer className="border-t-[3px] border-line bg-bg-2/60">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-ink-dim text-base">
          <span className="heading text-gold text-base">☕ {t("brand")}</span>
          <span>{t("footer.tagline")}</span>
          <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        </div>
      </footer>
    </>
  );
}
