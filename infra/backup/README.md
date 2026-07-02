# Backup (restic)

Nattlig kryptert backup av alle databaser + uploads-volumer til et eksternt
restic-repo (Hetzner Storage Box eller S3-kompatibelt). 30 dagers oppbevaring.

## Oppsett (én gang, på serveren)

1. Sett `RESTIC_REPOSITORY` og `RESTIC_PASSWORD` i `/opt/caffeine-level-critical/.env`.
   ** Taper du `RESTIC_PASSWORD` kan ikke backupen gjenopprettes – oppbevar den trygt.**
2. Installer restic: `apt-get install -y restic`
3. Kopier denne mappa til `/opt/caffeine-level-critical/infra/backup/` og gjør scriptet kjørbart:
   ```bash
   chmod +x /opt/caffeine-level-critical/infra/backup/backup.sh
   sudo cp /opt/caffeine-level-critical/infra/backup/caffeine-level-critical-backup.* /etc/systemd/system/
   sudo systemctl enable --now caffeine-level-critical-backup.timer
   ```

## Verifiser / gjenopprett

```bash
restic snapshots                      # liste over backuper
restic restore latest --target /tmp/restore
# Gjenopprett én tenant-DB fra all.sql:
#   hent ut databasen fra dumpen og kjør den mot en ny database.
```

Kjør en testgjenoppretting før lansering – en backup du aldri har restaurert teller ikke.
