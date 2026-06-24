#!/usr/bin/env bash
# Oppretter Stripe-produkter, -priser og webhook-endepunkt via Stripe CLI.
# Skriver ut ID-ene du skal legge i infra/.env (STRIPE_PRICE_* + STRIPE_WEBHOOK_SECRET).
#
#   1. stripe login                       # autentiser CLI mot kontoen din
#   2. BASE_DOMAIN=questroasted.app bash stripe-setup.sh
#
# Kjør i TEST-modus først (default). Ved go-live: bytt API-nøkkel til live og kjør på nytt.
set -euo pipefail

BASE_DOMAIN="${BASE_DOMAIN:?Sett BASE_DOMAIN, f.eks. questroasted.app}"
command -v stripe >/dev/null || { echo "Stripe CLI ikke funnet – installer den først"; exit 1; }

echo "▶ Produkt + pris: Standard (249 kr/mnd)…"
P_STD=$(stripe products create --name "Quest of the Roasted Bean – Standard" --format json | sed -n 's/.*"id": "\(prod_[^"]*\)".*/\1/p' | head -1)
PRICE_STD=$(stripe prices create \
  --unit-amount 24900 --currency nok \
  --recurring.interval month \
  --product "$P_STD" \
  --lookup-key standard_monthly \
  --format json | sed -n 's/.*"id": "\(price_[^"]*\)".*/\1/p' | head -1)

echo "▶ Produkt + pris: Team (499 kr/mnd)…"
P_TEAM=$(stripe products create --name "Quest of the Roasted Bean – Team" --format json | sed -n 's/.*"id": "\(prod_[^"]*\)".*/\1/p' | head -1)
PRICE_TEAM=$(stripe prices create \
  --unit-amount 49900 --currency nok \
  --recurring.interval month \
  --product "$P_TEAM" \
  --lookup-key team_monthly \
  --format json | sed -n 's/.*"id": "\(price_[^"]*\)".*/\1/p' | head -1)

echo "▶ Webhook-endepunkt → admin.${BASE_DOMAIN}…"
WH=$(stripe webhook_endpoints create \
  --url "https://admin.${BASE_DOMAIN}/stripe/webhook" \
  --enabled-events checkout.session.completed \
  --enabled-events customer.subscription.deleted \
  --enabled-events invoice.payment_failed \
  --format json)
WH_SECRET=$(echo "$WH" | sed -n 's/.*"secret": "\(whsec_[^"]*\)".*/\1/p' | head -1)

cat <<EOF

✅ Ferdig. Legg disse i infra/.env:

  STRIPE_PRICE_STANDARD=${PRICE_STD}
  STRIPE_PRICE_TEAM=${PRICE_TEAM}
  STRIPE_WEBHOOK_SECRET=${WH_SECRET}

Tips lokal test:  stripe listen --forward-to https://admin.${BASE_DOMAIN}/stripe/webhook
EOF
