#!/bin/sh
set -e

echo "▶ Kjører databasemigreringer..."
npx prisma migrate deploy

echo "▶ Sørger for standarddata og admin-bruker..."
npx tsx prisma/bootstrap.ts

echo "▶ Starter Caffeine Level Critical på port 3000..."
exec npm run start
