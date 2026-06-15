"use client";

import { useEffect } from "react";

// Setter <html lang> til gjeldende locale på klienten (rot-layout SSR-er "no").
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
