import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
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
  title: "Quest of the Roasted Bean",
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
