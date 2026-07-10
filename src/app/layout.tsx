import type { Metadata } from "next";
import { Press_Start_2P, Space_Grotesk, VT323 } from "next/font/google";
import { siteUrl } from "@/lib/seo";
import { APP_NAME_FULL } from "@/lib/brand";
import "./globals.css";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const pixelBody = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-body",
  display: "swap",
});

// Lesbar brødtekst for markedssidene (WCAG/lesbarhetspass). Press Start 2P
// beholdes til overskrifter/knapper og VT323 til korte «spill-elementer»;
// lange avsnitt settes i en font som tåler å leses.
const readable = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-readable",
  display: "swap",
});

export const metadata: Metadata = {
  // Gjør alle URL-baserte metadata-felt (canonical, hreflang, og:image …)
  // absolutte. Uten denne knekker delings- og kanoniske lenker.
  metadataBase: new URL(siteUrl),
  title: APP_NAME_FULL,
  description: "Spor kaffe, te og kakao på jobben ☕",
};

// Rot-layout: leverer <html>/<body> og fonter. Selve språket settes per
// locale i [locale]/layout via <HtmlLang>. lang="no" er standard ved SSR.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="no"
      className={`${pixel.variable} ${pixelBody.variable} ${readable.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
