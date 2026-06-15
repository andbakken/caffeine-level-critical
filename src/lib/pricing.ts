import type { Locale } from "@/i18n/routing";

// Lokalisert prising for den hostede versjonen.
// Bevisst IKKE valutakonvertering — faste markedspriser per locale (rund NOK-pris).
// Når Stripe kommer (Fase 2): lag separate Price-objekter per valuta som matcher dette.
type Price = {
  /** Ferdig formatert beløp, f.eks. "$20" eller "249 kr" */
  amount: string;
  /** Suffiks for periode, f.eks. "/mo" eller "/mnd" */
  period: string;
};

const HOSTED_PRICE: Record<Locale, Price> = {
  en: { amount: "$20", period: "/mo" },
  no: { amount: "249 kr", period: "/mnd" },
};

export function hostedPrice(locale: Locale): Price {
  return HOSTED_PRICE[locale] ?? HOSTED_PRICE.no;
}
