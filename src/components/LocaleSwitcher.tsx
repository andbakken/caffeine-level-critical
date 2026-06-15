"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Bytter språk på samme side ved å bytte locale-segmentet i URL-en.
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 text-base" role="group" aria-label="Language">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-current={l === locale ? "true" : undefined}
          className={
            l === locale
              ? "text-gold"
              : "text-ink-dim hover:text-accent-2 cursor-pointer"
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
