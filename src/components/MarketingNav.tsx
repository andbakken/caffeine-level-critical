"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

// hideSales: på hostet tenant og selvhost skjuler vi salgslenkene (produkt/priser/
// last-ned/kom-i-gang) og viser bare innlogging – de sidene redirectes bort (se proxy.ts).
export function MarketingNav({ hideSales = false }: { hideSales?: boolean }) {
  const t = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = hideSales ? (
    <Link href="/login" className="pixel-btn !py-2 !px-3" onClick={close}>
      {t("nav.loggInn")}
    </Link>
  ) : (
    <>
      <Link href="/produkt" className="hover:text-accent-2" onClick={close}>
        {t("nav.produkt")}
      </Link>
      <Link href="/last-ned" className="hover:text-accent-2" onClick={close}>
        {t("nav.lastNed")}
      </Link>
      <Link href="/priser" className="hover:text-accent-2" onClick={close}>
        {t("nav.priser")}
      </Link>
      <Link href="/login" className="hover:text-accent-2" onClick={close}>
        {t("nav.loggInn")}
      </Link>
      <Link
        href="/kom-i-gang"
        className="pixel-btn !py-2 !px-3"
        onClick={close}
        data-umami-event="cta_nav"
      >
        {t("nav.komIGang")}
      </Link>
    </>
  );

  return (
    <header className="border-b-[3px] border-line bg-bg-2/80 backdrop-blur sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link
          href={hideSales ? "/login" : "/"}
          className="heading text-gold text-base sm:text-xl truncate min-w-0"
          onClick={close}
        >
          ☕ {t("brand")}
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4 lg:gap-5 text-base lg:text-lg">
          {links}
          <LocaleSwitcher />
        </div>

        {/* Mobil: hamburger */}
        <button
          type="button"
          className="md:hidden pixel-btn !py-1 !px-3 shrink-0"
          aria-label="Meny"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="border-t-2 border-line bg-bg-2 px-4 py-4 flex flex-col gap-4 text-lg">
          {links}
          <div className="pt-2 border-t border-line/50">
            <LocaleSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
