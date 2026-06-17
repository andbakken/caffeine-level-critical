import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { APP_NAME } from "@/lib/brand";

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
