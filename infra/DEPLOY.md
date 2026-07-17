# Deploy / oppdatering – runbook

Kanonisk prosedyre for å rulle ut ny kode til den hostede driften. Dekker **både apex
(marketing-siden på hoveddomenet) og hver enkelt tenant-kunde**. Følg denne ved alle
oppdateringer – den er laget for å gjøre kunde-oppdateringer raske og trygge.

> Se [`README.md`](README.md) for arkitektur/engangsoppsett og
> [`../AGENTS.md`](../AGENTS.md) for prosjekt-kontekst.

## Nøkkelfakta (les én gang)

- **Ett image tjener alt.** `TENANT_IMAGE` (`caffeine-level-critical-app:latest`) kjøres
  av **både** apex (compose-service `marketing`) **og** alle tenants. Én build → begge.
- **To styringsmekanismer:**
  - **Apex** styres av **docker compose** (`infra/compose.infra.yml`, service `marketing`).
  - **Tenants** styres av **control-plane via dockerode** – containere heter `tenant-<subdomene>`.
- **Selv-migrering ved start.** Hver container kjører `prisma migrate deploy` + `bootstrap.ts`
  i [`../docker/entrypoint.sh`](../docker/entrypoint.sh) ved (re)start. Hver tenant har sin
  **egen database**, så migreringer kjøres per DB ved recreate – rekkefølge er likegyldig.
- **Prod-data = `bootstrap.ts`.** Standarddrikker/merker/admin kommer fra
  [`../prisma/bootstrap.ts`](../prisma/bootstrap.ts) (idempotent, ingen demo-data).
  **`prisma/seed.ts` skal ALDRI kjøres på prod** – den lager demo-brukere og demo-forbruk.
  Nye achievements/drikker må derfor speiles inn i `bootstrap.ts`, ikke bare `seed.ts`.

## Prosedyre

### 0. Forutsetninger (lokalt)
- Endringene er committet og **pushet til `main`**.
- Grønt lokalt: `npx tsc --noEmit` (app **og** `control-plane/`), og gjerne `npm run build`.
- Vet du om endringen har en **schema-migrering**? (Se `prisma/migrations/`.) I så fall:
  ingen ekstra steg – hver container migrerer sin egen DB ved recreate – men planlegg
  rollback deretter (migreringer er forover-only).

### 1. Oppdater koden på serveren
```bash
ssh deploy@<server>        # deploy-brukeren har GitHub deploy-key + ~/.ssh/config
cd /opt/caffeine-level-critical
git fetch origin && git reset --hard origin/main
```
Fallback som **root** (root mangler GitHubs known_hosts; repoet er offentlig):
```bash
git config --global --add safe.directory /opt/caffeine-level-critical   # ved «dubious ownership»
git pull --ff-only https://github.com/andbakken/caffeine-level-critical.git main
```

### 2. Bygg ny image (tjener både apex og tenants)
```bash
cd /opt/caffeine-level-critical/infra
docker compose -f compose.infra.yml --env-file .env build marketing
# Endret control-plane-kode (f.eks. rollout.ts/provision.ts)? Bygg den også:
docker compose -f compose.infra.yml --env-file .env build control-plane
```

### 3. Rull apex (marketing)
```bash
docker compose -f compose.infra.yml --env-file .env up -d marketing
# Endret control-plane? Re-skap den så rollout-verktøyet er oppdatert:
docker compose -f compose.infra.yml --env-file .env up -d control-plane
```

### 4. Rull alle tenants – én kommando, ingen velkomst-e-post
`rollout.ts` gjenskaper hver aktive tenant-container fra ny image, **én om gangen**, og
**stopper ved første feil** (en dårlig image rammer da bare én kunde). Den gjenbruker
tenantens eksisterende `DATABASE_URL` (ingen passord-rotasjon) og frisker opp øvrig env.
```bash
CP=infra-control-plane-1
docker exec $CP npx tsx src/rollout.ts             # dry-run: lister aktive tenants
docker exec $CP npx tsx src/rollout.ts --yes       # utfør: alle aktive, rullende
docker exec $CP npx tsx src/rollout.ts <sub> --yes # kun én tenant
```
> Krever at control-plane-imaget er oppdatert (steg 2–3) slik at `rollout.ts` finnes i
> containeren. Første gang denne runbooken tas i bruk: bygg+rull control-plane først.

### 5. Verifiser
```bash
# Apex
curl -s -o /dev/null -w 'apex %{http_code}\n' https://<domene>/
curl -s -o /dev/null -w '/en  %{http_code}\n' https://<domene>/en
# Tenant (per subdomene)
curl -s -o /dev/null -w 'tenant %{http_code}\n' https://<sub>.<domene>/
docker logs tenant-<sub> --tail 20        # «Bootstrap ferdig ✔» + «Ready»
# Data i DB (eksempel: antall merker). apex-DB = marketing; tenant-DB = tenant_<sub>
docker exec infra-postgres-1 psql -U postgres -d marketing   -tAc 'SELECT count(*) FROM "Achievement";'
docker exec infra-postgres-1 psql -U postgres -d tenant_<sub> -tAc 'SELECT count(*) FROM "Achievement";'
docker ps    # alle relevante containere skal stå «Up», ikke restarte i loop
```

## Rollback
```bash
cd /opt/caffeine-level-critical && git reset --hard <forrige-sha>
# gjenta steg 2–4
```
Alt er idempotent. **Unngå** å rulle tilbake over en schema-migrering uten en ned-migrering –
`migrate deploy` er forover-only.

## Gotchas
- **Serverens `infra/.env` er ikke i git.** Innfører en endring nye variabler, må de
  legges inn der *før* `up -d` – ellers starter containeren med tomme verdier.
  Sjekk mot `infra/.env.example` (som ER i git) ved hver utrulling som legger til env.
  Konkret nå: `LEGAL_*` (juridisk identitet) kom til 2026-07-17. Mangler de, **404-er
  `/vilkar` og `/personvern`** – en live, kommersiell side uten personvernerklæring.
  Verifiser etter utrulling: `curl -o /dev/null -w '%{http_code}' https://<domene>/personvern` → 200.
- `docker restart` / `docker compose restart` henter **ikke** ny image eller ny `.env`.
  Bruk `up -d` (apex) og `rollout.ts` (tenants) som **re-skaper** containere.
- `rollout.ts` rører kun tenants med status `active` **og** en kjørende container.
  `paused`/`failed` hoppes over – de må re-provisjoneres (flip status→`provisioning`,
  restart control-plane, eller vent på retry-løkka; NB re-provisjonering sender velkomst-e-post).
- Nye tenants provisjoneres automatisk fra ny image (control-plane bruker alltid
  `TENANT_IMAGE`), så de trenger ingenting fra denne runbooken.
