# ☕ Caffeine Level Critical: A Cubicle Odyssey

> Gjør kaffepausen til en konkurranse. Spor kaffe, te og kakao for hele teamet — med NFC-skanning, toppliste og merker.

**Caffeine Level Critical: A Cubicle Odyssey** er en liten, selvhostbar webapp som gjør hverdagens kaffepauser om til et lett spill. Fest en NFC-brikke ved kaffemaskinen, hold telefonen mot den, og koppen logges på sekundet — uten app eller innlogging i farten. Poeng, regelstyrte merker og topplister per person og avdeling gir litt sunn intern rivalisering.

Pixel-stil UI, bygget for mobil og internt nett.

---

## Funksjoner

- **📟 NFC-skanning** — én tagg per kaffemaskin. Ett tapp logger koppen. En tagg kan låses til én drikke, eller la brukeren velge. QR-kode fungerer for telefoner uten NFC.
- **🏆 Toppliste & avdelinger** — rangering i dag, denne uka eller totalt, per person og per avdeling.
- **🎖️ Regelstyrte merker** — admin definerer kriteriet (totalt antall, ulike drikketyper, antall av én drikke, eller tidspunkt på dagen). Deles ut automatisk.
- **📊 Live statistikk** — dashboard med trender og fordeling mellom drikker over tid.
- **🎮 Profiler** — kallenavn, avdeling og eget avatarbilde. Følg egne kopper, merker og plassering.
- **⚙️ Full admin** — opprett avdelinger, stasjoner, NFC-tagger og merker fra ett sted.

---

## Teknologi

| Lag | Valg |
| --- | --- |
| Rammeverk | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| Database | PostgreSQL 17 |
| ORM | [Prisma 7](https://www.prisma.io) med `pg` driver-adapter (ingen Rust-motor) |
| Auth | PIN + httpOnly session-cookie (`bcryptjs`) |
| Validering | Zod |
| Kjøretid | Node.js 24 |

---

## Kom i gang

Det finnes to veier: **selvhosting med Docker** (enklest — alt følger med) eller **lokal utvikling**.

### Alternativ A — Selvhosting med Docker (anbefalt)

Eneste krav er Docker. `docker compose` kjører både app og database, kjører migreringer og legger inn standarddata automatisk.

```bash
git clone https://github.com/andbakken/caffeine-level-critical.git
cd caffeine-level-critical

cp .env.example .env        # juster PORT, ADMIN_PIN, POSTGRES_PASSWORD ved behov
docker compose up -d
```

Åpne <http://localhost:3000> og logg inn med kallenavnet og PIN-en fra `.env` (standard `GameMaster` / `1234`).

Skal kollegene nå appen fra mobil? Bruk maskinens adresse på nettet, f.eks. `http://192.168.1.20:3000`.

> Merk: `db`-tjenesten i `docker-compose.yml` publiserer ikke port 5432 til vertsmaskinen — kun appen i compose-nettet snakker med den. Det er med vilje. For lokal utvikling utenfor Docker, se under.

### Alternativ B — Lokal utvikling

Krever Node.js 24 og en kjørende PostgreSQL på `localhost:5432`. Enkleste måte å få Postgres på:

```bash
docker run -d --name roastedbean-db \
  -e POSTGRES_USER=caffeine-level-critical \
  -e POSTGRES_PASSWORD=caffeine-level-critical \
  -e POSTGRES_DB=caffeine-level-critical \
  -p 5432:5432 postgres:17-alpine
```

Deretter:

```bash
cp .env.example .env        # DATABASE_URL peker allerede på containeren over
npm install
npm run db:deploy           # kjør migreringer
npm run db:seed             # standarddata + demo-brukere og -forbruk (fyller dashboardet)
npm run dev
```

Appen kjører på <http://localhost:3000>.

> Allerede en database fra før? `docker start roastedbean-db` holder for å starte den igjen.

---

## npm-skript

| Skript | Hva det gjør |
| --- | --- |
| `npm run dev` | Start utviklingsserver (Turbopack) |
| `npm run build` | Produksjonsbygg |
| `npm run start` | Kjør produksjonsbygg |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Lag og kjør en ny migrering (utvikling) |
| `npm run db:deploy` | Kjør eksisterende migreringer (produksjon) |
| `npm run db:generate` | Generer Prisma-klienten |
| `npm run db:seed` | Full seed: standarddata **+** demo-brukere og -forbruk |
| `npm run db:bootstrap` | Idempotent: kun standarddata + admin fra miljøvariabler (ingen demodata) |
| `npm run db:studio` | Prisma Studio (databaseutforsker) |

`db:seed` er for utvikling/demo. `db:bootstrap` er det produksjonscontaineren kjører ved hver oppstart.

---

## Miljøvariabler

| Variabel | Standard | Beskrivelse |
| --- | --- | --- |
| `DATABASE_URL` | — | PostgreSQL-tilkoblingsstreng (brukes ved lokal kjøring) |
| `POSTGRES_PASSWORD` | `caffeine-level-critical` | Passord for den innebygde databasen (Docker) |
| `EXTERNAL_DATABASE_URL` | _(tom)_ | Sett for å bruke en ekstern database i stedet for den innebygde |
| `PORT` | `3000` | Porten appen kjører på |
| `ADMIN_NICKNAME` | `GameMaster` | Kallenavn for admin-brukeren som opprettes ved oppstart |
| `ADMIN_PIN` | `1234` | PIN for admin-brukeren |
| `UPLOAD_DIR` | `/app/uploads` (Docker) | Hvor avatarbilder lagres |

---

## NFC-brikker

En tagg inneholder bare en nettlenke. Lag taggen i admin, trykk **«Kopier lenke»**, og skriv lenken til brikken med en gratis app som [NFC Tools](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc) (velg «Skriv» → «URL/URI»). Lenken har formen:

```
http://<din-adresse>/t/<token>
```

Fordi det er en vanlig URL, fungerer skanning på både iPhone og Android uten ekstra app. En QR-kode med samme lenke fungerer for telefoner uten NFC.

---

## Datamodell

Prisma-skjemaet (`prisma/schema.prisma`) består av:

- **Department** — avdeling/lag (navn, farge)
- **User** — kallenavn, PIN-hash, avdeling, avatar, admin-flagg
- **Drink** — drikketype (kaffe/te/kakao …) med poeng og ikon
- **Station** + **StationTag** — fysiske stasjoner og deres NFC-tagger
- **Consumption** — én logget kopp (bruker, drikke, kilde, stasjon, tidspunkt)
- **Achievement** + **UserAchievement** — regelstyrte merker og hvem som har tjent dem
- **Session** — opak token i httpOnly-cookie

Standard seed inkluderer drikkene kaffe/te/kakao, åtte merker (f.eks. «Morgenfugl», «Koppmester», «Kaffeholiker») og — i `db:seed` — demo-brukere som `PixelPelle` og `KoffeinKari`.

---

## Prosjektstruktur

```
src/
  app/
    (app)/          Selve appen (dashboard, toppliste, statistikk, admin, /t/[token])
    (marketing)/    Landingsside, produkt, last-ned
    api/            Route handlers (auth, consumptions, stats, admin, tap, avatar)
  components/       UI-komponenter (pixel-stil)
  lib/              auth, db, stats, achievements, consumption, uploads, validation
prisma/
  schema.prisma     Datamodell
  migrations/       SQL-migreringer
  seed.ts           Full seed (demo)
  bootstrap.ts      Produksjons-oppstart (idempotent)
docker/             entrypoint.sh
```

---

## Hostet versjon

I tillegg til selvhosting finnes en planlagt hostet versjon ($20/mnd) med sikker innlogging per bruker, automatiske oppdateringer og backup inkludert. Se produktsiden i appen for sammenligning.

---

## Lisens

Lisensiert under **GNU Affero General Public License v3.0** — se [LICENSE](./LICENSE).

Copyright © 2026 Anders Moen Bakken.

Kort fortalt: du står fritt til å bruke, endre og selvhoste løsningen, men dersom du tilbyr den som en nettverkstjeneste til andre, må kildekoden (inkludert dine endringer) gjøres tilgjengelig under samme lisens. Den hostede versjonen driftes av rettighetshaver. Ta kontakt for kommersiell lisensiering uten AGPL-forpliktelsene.
