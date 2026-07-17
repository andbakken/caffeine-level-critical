import type { Locale } from "@/i18n/routing";

// Prising for den hostede versjonen.
// Samme NOK-pris på alle språk. Checkout belaster ÉN Stripe-Price uansett locale
// (control-plane: standardPrice()), så en egen USD-pris her ville annonsert noe annet
// enn kortet faktisk trekkes for – og motsagt vilkårene, som sier «249 NOK per month».
// Skal det selges i USD, må Price-objektet i Stripe få currency_options først
// (se stripe-setup.sh); prisen her følger etter, ikke omvendt.
type Price = {
  /** Ferdig formatert beløp, f.eks. "249 kr" eller "NOK 249" */
  amount: string;
  /** Suffiks for periode, f.eks. "/mo" eller "/mnd" */
  period: string;
  /** Numerisk månedspris — til strukturerte data (JSON-LD Offer). */
  value: number;
  /** ISO 4217-valutakode — til strukturerte data (JSON-LD Offer). */
  currency: string;
};

const HOSTED_PRICE: Record<Locale, Price> = {
  en: { amount: "NOK 249", period: "/mo", value: 249, currency: "NOK" },
  no: { amount: "249 kr", period: "/mnd", value: 249, currency: "NOK" },
};

export function hostedPrice(locale: Locale): Price {
  return HOSTED_PRICE[locale] ?? HOSTED_PRICE.no;
}
