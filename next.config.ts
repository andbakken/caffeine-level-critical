import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma pg-adapter og pg kjøres som eksterne pakker (ikke bundlet).
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
};

export default nextConfig;
