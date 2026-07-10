"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

// Sticky bunn-CTA på mobil: konverteringsknappen er alltid ett tommel-trykk unna,
// uansett hvor langt man har scrollet. Skjules på /kom-i-gang (målet for lenken)
// og vises ikke på md+ der nav-knappen alltid er synlig.
export function StickyCta() {
  const t = useTranslations("Common");
  const pathname = usePathname();
  if (pathname.startsWith("/kom-i-gang")) return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t-[3px] border-line bg-bg-2/95 backdrop-blur px-4 py-3">
      <Link
        href="/kom-i-gang"
        className="pixel-btn pixel-btn-gold block w-full"
        data-umami-event="cta_sticky"
      >
        {t("nav.komIGang")}
      </Link>
    </div>
  );
}
