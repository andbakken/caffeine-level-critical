#!/usr/bin/env bash
# Provisjonerer Hetzner-VPS-en for hostet drift via hcloud CLI.
# Idempotent: hopper over ting som allerede finnes. Kjør lokalt.
#
#   1. Installer hcloud:   scoop install hcloud   (Windows)  |  brew install hcloud  (mac)
#   2. Fyll inn infra/.env (HCLOUD_TOKEN, SSH_*, ADMIN_SSH_IP, SERVER_* …)
#   3. bash infra/hetzner/provision.sh
#
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${HERE}/../.env"
[ -f "$ENV_FILE" ] || { echo "Mangler infra/.env (kopier fra infra/.env.example)"; exit 1; }
set -a; . "$ENV_FILE"; set +a

export HCLOUD_TOKEN
command -v hcloud >/dev/null || { echo "hcloud CLI ikke funnet – installer den først"; exit 1; }
[ -n "${HCLOUD_TOKEN:-}" ] || { echo "HCLOUD_TOKEN mangler i infra/.env"; exit 1; }
[ -n "${ADMIN_SSH_IP:-}" ] || { echo "ADMIN_SSH_IP mangler (din IP/CIDR for SSH-låsing)"; exit 1; }

SSH_PUB="${SSH_PUBLIC_KEY_FILE/#\~/$HOME}"

echo "▶ SSH-nøkkel ($SSH_KEY_NAME)…"
if ! hcloud ssh-key describe "$SSH_KEY_NAME" >/dev/null 2>&1; then
  hcloud ssh-key create --name "$SSH_KEY_NAME" --public-key-from-file "$SSH_PUB"
fi

echo "▶ Brannmur (caffeine-level-critical-fw)…"
if ! hcloud firewall describe caffeine-level-critical-fw >/dev/null 2>&1; then
  hcloud firewall create --name caffeine-level-critical-fw
fi
# Erstatt regler (idempotent): SSH kun fra din IP, HTTP/HTTPS åpent.
hcloud firewall replace-rules caffeine-level-critical-fw --rules-file /dev/stdin <<JSON
[
  { "direction":"in", "protocol":"tcp", "port":"22",  "source_ips":["${ADMIN_SSH_IP}"] },
  { "direction":"in", "protocol":"tcp", "port":"80",  "source_ips":["0.0.0.0/0","::/0"] },
  { "direction":"in", "protocol":"tcp", "port":"443", "source_ips":["0.0.0.0/0","::/0"] }
]
JSON

echo "▶ Server ($SERVER_NAME)…"
if ! hcloud server describe "$SERVER_NAME" >/dev/null 2>&1; then
  hcloud server create \
    --name "$SERVER_NAME" \
    --type "$SERVER_TYPE" \
    --location "$LOCATION" \
    --image "$IMAGE" \
    --ssh-key "$SSH_KEY_NAME" \
    --firewall caffeine-level-critical-fw \
    --user-data-from-file "${HERE}/cloud-init.yaml"
else
  echo "  finnes allerede – hopper over."
fi

IP="$(hcloud server ip "$SERVER_NAME")"
echo
echo "✅ Ferdig. Server-IP: $IP"
echo
echo "Neste steg:"
echo "  1) DNS hos registraren/Hetzner DNS:  A @ -> $IP   og   A * -> $IP   (wildcard)"
echo "  2) Vent på cloud-init (~2 min), så:"
echo "       scp infra/.env infra/compose.infra.yml deploy@$IP:/opt/caffeine-level-critical/"
echo "       ssh deploy@$IP 'cd /opt/caffeine-level-critical && docker compose -f compose.infra.yml --env-file .env up -d'"
