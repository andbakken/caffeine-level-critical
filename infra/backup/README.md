# Backup (restic)

Nattlig kryptert backup av alle databaser + uploads-volumer til et eksternt
restic-repo (Hetzner Storage Box eller S3-kompatibelt). 30 dagers oppbevaring.

## Oppsett (én gang, på serveren)

1. Sett `RESTIC_REPOSITORY` og `RESTIC_PASSWORD` i `/opt/brewquest/.env`.
   ** Taper du `RESTIC_PASSWORD` kan ikke backupen gjenopprettes – oppbevar den trygt.**
2. Installer restic: `apt-get install -y restic`
3. Kopier denne mappa til `/opt/brewquest/infra/backup/` og gjør scriptet kjørbart:
   ```bash
   chmod +x /opt/brewquest/infra/backup/backup.sh
   sudo cp /opt/brewquest/infra/backup/brewquest-backup.* /etc/systemd/system/
   sudo systemctl enable --now brewquest-backup.timer
   ```

## Verifiser / gjenopprett

```bash
restic snapshots                      # liste over backuper
restic restore latest --target /tmp/restore
# Gjenopprett én tenant-DB fra all.sql:
#   hent ut databasen fra dumpen og kjør den mot en ny database.
```

Kjør en testgjenoppretting før lansering – en backup du aldri har restaurert teller ikke.
