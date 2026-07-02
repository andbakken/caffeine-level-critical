import { useTranslations } from "next-intl";
import { MarketingNav } from "@/components/MarketingNav";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const t = useTranslations("Common");

  return (
    <>
      <MarketingNav />

      <main className="flex-1 w-full">{children}</main>

      <footer className="border-t-[3px] border-line bg-bg-2/60">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-ink-dim text-base">
          <span className="heading text-gold text-base">☕ {t("brandFull")}</span>
          <span>{t("footer.tagline")}</span>
          <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        </div>
      </footer>
    </>
  );
}
