import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Hold API, NFC-token-sider og innloggede sider ute av søkeresultatene
      // (begge språk – «no» er uten prefiks, «en» under /en).
      disallow: [
        "/api/",
        "/t/",
        "/en/t/",
        "/dashboard",
        "/me",
        "/stats",
        "/leaderboard",
        "/admin",
        "/login",
        "/register",
        "/en/dashboard",
        "/en/me",
        "/en/stats",
        "/en/leaderboard",
        "/en/admin",
        "/en/login",
        "/en/register",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
