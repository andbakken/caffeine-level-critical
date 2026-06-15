import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Prisma pg-adapter og pg kjøres som eksterne pakker (ikke bundlet).
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  // Tillat at mobil/andre enheter på lokalnettet når dev-serveren via
  // maskinens IP (ellers blokkerer Next dev kryss-origin-ressurser, og
  // innlogging/hydrering «gjør ingenting»). Gjelder kun `next dev`.
  // Oppdater IP-en hvis maskinen får en ny adresse.
  allowedDevOrigins: ["100.102.217.56", "192.168.10.193"],
};

export default withNextIntl(nextConfig);
