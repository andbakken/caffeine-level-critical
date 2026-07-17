#!/usr/bin/env bash
# Oppretter Stripe-produkter, -priser og webhook-endepunkt via Stripe CLI.
# Skriver ut ID-ene du skal legge i infra/.env (STRIPE_PRICE_* + STRIPE_WEBHOOK_SECRET).
#
#   1. stripe login                       # autentiser CLI mot kontoen din
#   2. BASE_DOMAIN=caffeinelevelcritical.com bash stripe-setup.sh
#
# Kjør i TEST-modus først (default). Ved go-live: bytt API-nøkkel til live og kjør på nytt.
#
# MVA: vi setter bevisst IKKE --tax-behavior, og checkout bruker ikke automatic_tax.
# Selger er ikke MVA-registrert og har da ikke lov til å vise MVA på fakturaen.
# Prisen står som «unspecified», som er den ENESTE reversible varianten – Stripe:
# «Once specified as either inclusive or exclusive, it cannot be changed.» Blir du
# MVA-pliktig (lovpålagt over 50 000 kr / rullerende 12 mnd), tas valget da.
#
# Valuta: én NOK-pris for alle språk – src/lib/pricing.ts annonserer det samme.
# Skal det selges i USD, legg til currency_options HER først, så i pricing.ts.
set -euo pipefail

BASE_DOMAIN="${BASE_DOMAIN:?Sett BASE_DOMAIN, f.eks. caffeinelevelcritical.com}"
command -v stripe >/dev/null || { echo "Stripe CLI ikke funnet – installer den først"; exit 1; }

echo "▶ Produkt + pris: Standard (249 kr/mnd)…"
P_STD=$(stripe products create --name "Caffeine Level Critical – Standard" --format json | sed -n 's/.*"id": "\(prod_[^"]*\)".*/\1/p' | head -1)
PRICE_STD=$(stripe prices create \
  --unit-amount 24900 --currency nok \
  --recurring.interval month \
  --product "$P_STD" \
  --lookup-key standard_monthly \
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
  STRIPE_WEBHOOK_SECRET=${WH_SECRET}

Tips lokal test:  stripe listen --forward-to https://admin.${BASE_DOMAIN}/stripe/webhook
EOF
