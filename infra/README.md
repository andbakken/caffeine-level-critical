# Hostet drift – runbook

Self-hostet SaaS (modell A): mange tenant-containere på én Hetzner-VPS, bak Traefik,
med delt Postgres og en control-plane som provisjonerer på Stripe-webhook.
Strategien står i [../docs/hostet-drift-og-prising.md](../docs/hostet-drift-og-prising.md).

## Engangsoppsett

1. **Kontoer (manuelt):** Hetzner (API-token), domene + DNS, Stripe, Resend, backup-mål.
2. **Konfig:** `cp infra/.env.example infra/.env` og fyll inn. `infra/.env` er git-ignorert.
3. **Provisjoner serveren (hcloud CLI):**
   ```bash
   bash infra/hetzner/provision.sh
   ```
   Skriver ut server-IP og neste steg.
4. **DNS:** Hos registraren/Hetzner DNS, sett to A-records mot server-IP:
   `A @ → IP` og `A * → IP` (wildcard – gjør at alle `<sub>.<domene>` virker).
5. **Start infra-stacken på serveren:**
   ```bash
   scp infra/.env infra/compose.infra.yml deploy@<IP>:/opt/brewquest/
   ssh deploy@<IP> 'cd /opt/brewquest && docker compose -f compose.infra.yml --env-file .env up -d'
   ```
6. **Stripe-produkter + webhook:** `bash stripe-setup.sh` (se Fase 3).

## Hemmeligheter (sops + age, OSS)

For å kunne committe `infra/.env` kryptert:
```bash
age-keygen -o ~/.config/sops/age/keys.txt          # lag nøkkel én gang
# legg public key i .sops.yaml, så:
sops -e infra/.env > infra/.env.enc                # krypter (denne kan committes)
sops -d infra/.env.enc > infra/.env                # dekrypter lokalt
```
Aldri commit `infra/.env` i klartekst.

## Sikkerhet (innbakt)

- **Brannmur:** Hetzner Cloud Firewall slipper kun inn 22/80/443; SSH er låst til din IP (`ADMIN_SSH_IP`). `ufw` på serveren er belte+seler.
- **SSH:** kun nøkkel (passord + root-login av), satt i `cloud-init.yaml`.
- **Postgres:** kun på internt docker-nett (`bq_data`, `internal: true`) – aldri eksponert mot internett. Hver tenant får egen database + egen rolle med tilfeldig passord.
- **Stripe:** webhook-signatur verifiseres alltid; vi provisjonerer aldri uten gyldig signatur. Hemmelig nøkkel og DB-passord bor kun server-side.
- **Admin-innlogging:** passordløs e-post magic-link (kort levetid, engangsbruk, kun sha256 i DB) i stedet for delt PIN over internett. Rate-limitet.
- **Cookies:** `secure` slås på automatisk på HTTPS.
- **Hemmeligheter:** hold `infra/.env` utenfor git (eller krypter med sops/age). Roter `POSTGRES_SUPER_PASSWORD` og Stripe-nøkler ved mistanke.
- Kjør `/security-review` på diffen før go-live.

## Daglig drift

- **Ny kunde:** skjer automatisk via Stripe-webhook → control-plane. Ingen manuelle steg.
- **Oppgrader appen:** bygg nytt `TENANT_IMAGE`, rull tenant-containere én etter én (de selv-migrerer ved restart via `docker/entrypoint.sh`).
- **Skaler opp:** `hcloud server change-type <navn> cx43` (én reboot, ingen migrering).
- **Backup:** restic-timer (Fase 4). Verifiser med `restic snapshots`.
- **Logger:** `docker logs <container>`, Traefik-access-logg.
