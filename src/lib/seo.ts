import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { APP_NAME, APP_NAME_FULL } from "@/lib/brand";
import { hostedPrice } from "@/lib/pricing";

/** Full base-URL for det offentlige marketing-domenet (uten etterfølgende «/»).
 *  Settes via NEXT_PUBLIC_SITE_URL i prod. Faller tilbake til localhost i dev
 *  slik at metadataBase/canonical/sitemap aldri bygger på en relativ URL. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = APP_NAME;

const ogLocale: Record<Locale, string> = { no: "nb_NO", en: "en_US" };

/** Bygger canonical + hreflang + Open Graph/Twitter for en markedsføringsside.
 *
 *  `path` er rute-segmentet uten språkprefiks: "" (forsiden), "produkt"
 *  eller "last-ned". next-intl kjører localePrefix "as-needed", så «no» er
 *  uten prefiks og «en» ligger under /en. Delingsbildet kommer fra
 *  opengraph-image-konvensjonen, så vi setter ikke images her. */
export function marketingMetadata(
  locale: Locale,
  path: string,
  meta: { title: string; description: string },
): Metadata {
  const seg = path ? `/${path}` : "";
  const noUrl = seg || "/";
  const enUrl = `/en${seg}`;
  const canonical = locale === "en" ? enUrl : noUrl;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical,
      languages: { no: noUrl, en: enUrl, "x-default": noUrl },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocale[locale],
      url: canonical,
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

/* ---------- JSON-LD (strukturerte data for rich results) ----------
 * Rendres som <script type="application/ld+json"> i side-/layout-komponentene,
 * slik Next-dokumentasjonen anbefaler (native <script>, ikke next/script). */

/** Serialiserer JSON-LD XSS-trygt: «<» escapes så innholdet aldri kan lukke
 *  script-taggen (jf. guiden i node_modules/next/dist/docs/01-app/02-guides/json-ld.md). */
export function jsonLdString(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Organisasjonen bak tjenesten — legges i marketing-layouten (én gang per side). */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: siteUrl,
  };
}

/** Produktet med begge prisplanene (gratis selvhostet + hostet månedspris).
 *  Gir sjanse til pris-utdrag i søkeresultatet. */
export function softwareAppJsonLd(
  locale: Locale,
  names: { description: string; selfHosted: string; hosted: string },
) {
  const price = hostedPrice(locale);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME_FULL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description: names.description,
    offers: [
      {
        "@type": "Offer",
        name: names.selfHosted,
        price: 0,
        priceCurrency: price.currency,
      },
      {
        "@type": "Offer",
        name: names.hosted,
        price: price.value,
        priceCurrency: price.currency,
      },
    ],
  };
}

/** FAQ-utdrag i Google — bygges fra samme i18n-data som FAQ-seksjonen viser. */
export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
