# Demo-instansen (`demo.<domene>`) – runbook

Den offentlige «prøv uten å registrere»-instansen fra designgjennomgangen
(steg 3, punkt 09): en permanent sandkasse-tenant der besøkende scanner en
QR-kode på markedssiden, logger en ekte kopp fra egen mobil og ser seg selv
dukke opp på topplista.

> Generell drift/oppgradering: [`DEPLOY.md`](DEPLOY.md). Demo-tenanten rulles
> som alle andre tenants (`rollout.ts`), ingen særbehandling ved oppgradering.

## Hva DEMO_MODE=1 gjør (app-siden)

Alt bor i [`../src/lib/demo.ts`](../src/lib/demo.ts) og startes fra
[`../src/instrumentation.ts`](../src/instrumentation.ts) ved container-boot —
helt inaktivt uten `DEMO_MODE=1`:

- **Demo-verden (idempotent):** avdelingene Utvikling/Regnskap/Servicedesk/
  Besøkende, seks fiktive kolleger (KoffeinKari, PixelPelle, …) uten PIN
  (kan ikke logges inn som), én stasjon med brikke-token **`demo`** →
  QR-koden på markedssiden peker fast på `/t/demo`.
- **Simulering:** hvert 5. minutt logger tilfeldige kolleger kopper etter en
  dagsrytme (morgenrush 07–10, lunsj, ettermiddag; natt = stille). Kollegene
  tjener ekte merker underveis.
- **Gjeste-innlogging:** `/t/demo` (og `/api/demo/guest?next=…`) oppretter en
  anonym `Gjest-xxxx`-bruker med tilfeldig pixel-avatar og sesjon — ingen
  registrering. Maks 5 nye gjester per IP per time; 20 s cooldown per drikke
  gjelder som ellers. Ruten svarer 404 utenfor demo-modus.
- **Nattlig reset:** første tick etter midnatt slettes alt forbruk, alle
  merker og alle gjester; kollegene får ny, plausibel ukeshistorikk så
  toppliste/statistikk aldri er tomme.

`REQUIRE_INVITE=1` beholdes: tilfeldige kan ikke registrere varige profiler
på demoen — gjesteflyten er eneste vei inn, og den er flyktig.

## Provisjonering (én gang)

```bash
# 1. DNS: demo.<domene> må peke på serveren (som øvrige tenant-subdomener).
# 2. Bygg oppdatert image + control-plane (DEPLOY.md steg 2).
# 3. Provisjoner demo-tenanten (idempotent, ingen velkomst-e-post):
CP=infra-control-plane-1
docker exec $CP npx tsx src/provision-demo.ts
```

Containeren `tenant-demo` får `DEMO_MODE=1` automatisk (hardkodet på
subdomenet `demo` i [`../control-plane/src/provision.ts`](../control-plane/src/provision.ts)),
også ved senere `rollout.ts`-oppgraderinger.

## Vis demo-seksjonen på markedssiden

Apex viser QR-seksjonen på landingssiden KUN når `DEMO_URL` er satt
(runtime-env — ingen rebuild nødvendig):

```yaml
# infra/compose.infra.yml → service marketing → environment:
DEMO_URL: https://demo.<domene>
```

```bash
docker compose -f compose.infra.yml --env-file .env up -d marketing
```

## Verifisering

```bash
curl -s -o /dev/null -w 'demo   %{http_code}\n' https://demo.<domene>/t/demo   # 307 → gjest → tap-side
docker logs tenant-demo | grep '\[demo\]'   # «demo-modus aktiv: simulering …»
```

Sjekk så på markedssiden at QR-seksjonen vises, scan koden med en mobil og
se gjesten dukke opp på `https://demo.<domene>` (knappen «Åpne demo-topplista»
gir en gjestesesjon rett til `/leaderboard`).

## Avvikling

Fjern `DEMO_URL` fra apex-miljøet (seksjonen forsvinner) og deprovisjoner
tenanten som vanlig ved behov.
