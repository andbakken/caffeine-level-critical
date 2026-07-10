import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// Kun de offentlige markedsføringssidene skal indekseres. Innloggede sider
// (dashboard, leaderboard, …) og NFC-token-sider holdes ute via robots.ts.
const pages: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "produkt", priority: 0.8 },
  { path: "priser", priority: 0.9 },
  { path: "merker", priority: 0.7 },
  { path: "koffein-kalkulator", priority: 0.6 },
  { path: "utfordring", priority: 0.5 },
  { path: "kom-i-gang", priority: 0.6 },
  { path: "last-ned", priority: 0.8 },
  { path: "vilkar", priority: 0.3 },
  { path: "personvern", priority: 0.3 },
  { path: "databehandleravtale", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return pages.map(({ path, priority }) => {
    const seg = path ? `/${path}` : "";
    return {
      url: `${siteUrl}${seg}`,
      lastModified,
      changeFrequency: "monthly",
      priority,
      alternates: {
        languages: {
          no: `${siteUrl}${seg}`,
          en: `${siteUrl}/en${seg}`,
        },
      },
    };
  });
}
