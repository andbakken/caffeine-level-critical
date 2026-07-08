import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Prisma pg-adapter og pg kjøres som eksterne pakker (ikke bundlet).
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  // Tillat at mobil/andre enheter på lokalnettet når dev-serveren via
  // maskinens IP (ellers blokkerer Next dev kryss-origin-ressurser, og
  // innlogging/hydrering «gjør ingenting»). Gjelder kun `next dev`.
  // Sett DEV_ORIGINS i .env til din maskins adresse(r), kommaseparert,
  // f.eks. DEV_ORIGINS=192.168.1.20,100.x.y.z (Tailscale).
  allowedDevOrigins:
    process.env.DEV_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
};

export default withNextIntl(nextConfig);
