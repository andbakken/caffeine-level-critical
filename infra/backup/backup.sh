#!/usr/bin/env bash
# Nattlig backup: SQL-dump av alle databaser + alle uploads-volumer → restic-repo
# (kryptert, 30 dagers oppbevaring). Kjøres på serveren via systemd-timer.
set -euo pipefail

ENV_FILE="${ENV_FILE:-/opt/caffeine-level-critical/.env}"
set -a; . "$ENV_FILE"; set +a
export RESTIC_REPOSITORY RESTIC_PASSWORD

PG="$(docker ps --filter name=postgres --format '{{.Names}}' | head -1)"
[ -n "$PG" ] || { echo "Fant ingen postgres-container"; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "▶ Dumper alle databaser…"
docker exec -e PGPASSWORD="$POSTGRES_SUPER_PASSWORD" "$PG" \
  pg_dumpall -U "$POSTGRES_SUPER_USER" > "$TMP/all.sql"

# Initialiser repo første gang (idempotent).
restic snapshots >/dev/null 2>&1 || restic init

echo "▶ Restic backup (SQL + uploads)…"
UPLOAD_DIRS="$(ls -d /var/lib/docker/volumes/*uploads*/_data 2>/dev/null || true)"
# shellcheck disable=SC2086
restic backup "$TMP/all.sql" $UPLOAD_DIRS

echo "▶ Rydder gamle snapshots…"
restic forget --keep-daily 30 --prune

echo "✅ Backup ferdig."
