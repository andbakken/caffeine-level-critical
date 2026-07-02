import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
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
    <html lang="no" className={`${pixel.variable} ${pixelBody.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
