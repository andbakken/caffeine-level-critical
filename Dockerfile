# Caffeine Level Critical – produksjonsbilde (Next.js 16 + Prisma 7 + pg driver adapter)

# ---- avhengigheter ----
FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- bygg ----
FROM node:24-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Marketing-domenet må bakes inn ved build fordi sitemap.ts/robots.ts prerendres
# statisk. Uten dette faller siteUrl tilbake på http://localhost:3000 og
# produksjons-sitemapen blir full av localhost-URLer. Se docs/lanseringsplan.md (A11).
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---- kjøretid ----
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV UPLOAD_DIR=/app/uploads

# Prisma sin migreringsmotor trenger openssl
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Fulle node_modules (inkl. prisma CLI + tsx for migrering og bootstrap ved oppstart)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/generated ./src/generated
COPY package.json next.config.ts prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh && mkdir -p /app/uploads

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
