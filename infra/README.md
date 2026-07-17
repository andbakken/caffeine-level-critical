# Hostet drift – runbook

Self-hostet SaaS (modell A): mange tenant-containere på én Hetzner-VPS, bak Traefik,
med delt Postgres og en control-plane som provisjonerer på Stripe-webhook.

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
   scp infra/.env infra/compose.infra.yml deploy@<IP>:/opt/caffeine-level-critical/
   ssh deploy@<IP> 'cd /opt/caffeine-level-critical && docker compose -f compose.infra.yml --env-file .env up -d'
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
- **Provisjoneringsfeil:** control-plane setter status `failed` og varsler `OWNER_EMAIL`.
  Retry kjører automatisk ved oppstart og hver time (idempotent) – som regel trengs
  ingen manuell handling. Sjekk `docker logs <control-plane>` ved gjentatte varsler.

## Oppsigelse og sletting

- **Oppsigelse:** når kunden sier opp i Stripe (eller ved endelig betalingsmislighold),
  pauses instansen automatisk via webhook (`status = paused`, container stoppet). Data
  beholdes.
- **Sletting (deprovisjonering):** vilkårene og personvernerklæringen
  (`src/content/legal.ts`) lover sletting etter «en rimelig oppbevaringsperiode»;
  i praksis 60 dager. Er det signert en databehandleravtale med kunden, gjelder
  fristen der. Tenanten fjernes manuelt:
  ```bash
  CP=$(docker ps --filter name=control-plane --format '{{.Names}}' | head -1)
  docker exec "$CP" npx tsx src/deprovision.ts <subdomain>         # dry-run: viser hva som fjernes
  docker exec "$CP" npx tsx src/deprovision.ts <subdomain> --yes   # utfør: container, volum, DB, rolle, registry-rad
  ```
  Skriptet er idempotent. **Merk:** backupen (`pg_dumpall`) inneholder fortsatt tenanten
  inntil restic-rotasjonen (30 dager) har passert. Reell sletting = deprovision + 30 dager.
