# Branding-profil — Quest of the Roasted Bean

> Input-dokument til AI-markedsfører / innholdsgenerering for sosiale medier (Instagram, LinkedIn, m.fl.)
> Lim inn hele dette dokumentet som kontekst hver gang noe nytt skal lages.

---

## 1. Hva er produktet

**Quest of the Roasted Bean** er en liten, selvhostbar webapp som gjør kaffepausen på jobben til et lett spill. Man fester en NFC-brikke ved kaffemaskinen; å holde telefonen mot den logger koppen automatisk — ingen app, ingen innlogging i farten. Brukere samler poeng, låser opp regelstyrte merker ("achievements") og konkurrerer på topplister per person og per avdeling.

- **Selvhostet**: gratis, kjøres med Docker, du eier dataene.
- **Hostet** (planlagt/kommende): ca. $20/mnd, vi drifter alt — sikker innlogging, automatiske oppdateringer, backup.

**Kategori:** internt teamverktøy / lekent "gamification"-produkt for kontormiljø. Ikke et forbrukerprodukt for sluttkunder utenfor jobbsammenheng — det er noe et team eller en bedrift setter opp for sine egne folk.

---

## 2. Målgruppe

- **Primær:** IT/drift-folk, teamledere og kontoransvarlige i små og mellomstore bedrifter (ofte tech-nære miljøer) som setter opp interne verktøy og liker selvhosting.
- **Sekundær:** Vanlige kontoransatte som bruker appen daglig — de er ikke kjøperen, men de er hvem innholdet ofte skal vise/underholde (skjermbilder av toppliste, merker, "wins").
- **Geografi/språk:** Norge primært (norsk tone, norsk humor), med engelsk som sekundærspråk for et internasjonalt/teknisk publikum (selvhosting-miljøet er internasjonalt).
- **Hvor de er:** LinkedIn (B2B, IT/dev-ledere, teamkultur-vinkling), Instagram (mer visuell, kontorhumor, pixel-art-estetikk, "se hva teamet vårt fant på").

---

## 3. Merkevareidentitet

### Navn og tagline
- **Navn:** Quest of the Roasted Bean
- **Tagline:** "Gjør kaffepausen til en konkurranse."
- **Engelsk tagline (om nødvendig):** "Turn the coffee break into a competition."

### Posisjonering
Et lavterskel, gratis-å-selvhoste verktøy som tilfører litt sunn intern rivalisering og lekenhet i en helt vanlig kontorrutine (kaffe/te/kakao). Det er ikke et "produktivitetsverktøy" eller en seriøs SaaS-plattform — det er en liten, snill spillmekanikk lagt på toppen av noe folk allerede gjør hver dag.

### Personlighet (brand personality)
- **Lekent og varmt**, ikke corporate.
- **Litt nerdy/retro** — pixel-art/8-bit-estetikk, "quest", "achievements", spillterminologi.
- **Selvironisk kontorhumor** — kaffe som "koffeinmisbruk", merker som "Koppmester" og "Kaffeholiker".
- **Praktisk og no-nonsense på det tekniske** — selvhosting, Docker, eier-egne-data — appellerer til folk som vil ha kontroll, ikke til buzzword-markedsføring.
- **Liten skala, ikke "big tech"** — bygget av én person (Anders Moen Bakken), åpen kildekode (AGPL v3). Det er greit, og ofte en styrke, å virke som et indie-/hobbyprosjekt som er blitt skikkelig bra — ikke som et VC-finansiert SaaS-monster.

### Kjerneverdier
1. Lekenhet i hverdagen — gjør noe trivielt litt morsommere.
2. Eierskap og kontroll — selvhosting, egne data, ingen lock-in.
3. Enkelhet — ingen app å installere, ett tapp logger koppen.
4. Fellesskap på kontoret — liten, sunn rivalisering som bygger kultur, ikke stress.

### Stemme / tone of voice
- Snakk **til** teamet/kontoret, ikke **om** et abstrakt "produktivitets-økosystem".
- Bruk konkrete, hverdagslige bilder: kaffemaskinen, lounge, "hvem drikker mest på kontoret".
- Lett humor er kjernen — ikke vær høytidelig.
- Korte setninger. Direkte. Ingen "synergier" eller "verdiøkende løsninger".
- Spillreferanser er på sin plass («quest», «merker», «toppliste», «koffeinkonge») — men ikke overdriv gamer-slang utover det merkevaren allerede bruker.
- Norsk tone skal være naturlig norsk (ikke direkte oversatt engelsk-tenkning). Engelsk versjon skal være naturlig engelsk, ikke en oversettelse ord for ord.

---

## 4. Visuell identitet

### Stil
8-bit / pixel-art retro-estetikk, NES-inspirert. Chunky, steppede border-skygger, ikke myke skygger eller glassmorphism. Bilder skal se ut som pixel-art (skarpe kanter, ikke utjevnet/blurry — "image-rendering: pixelated").

### Fargepalett
| Bruk | Hex | Navn i kodebasen |
| --- | --- | --- |
| Bakgrunn (mørk) | `#0d0b1a` | bg |
| Bakgrunn 2 | `#161329` | bg-2 |
| Panel | `#1f1b3a` | panel |
| Panel 2 | `#2a2450` | panel-2 |
| Tekst (lys) | `#e8e6ff` | ink |
| Tekst (dempet) | `#9a92c9` | ink-dim |
| Linjer/border | `#3a3266` | line |
| **Aksent (primær lilla)** | `#7c5cff` | accent |
| **Aksent (grønn)** | `#39d98a` | accent-2 |
| **Gull** | `#ffd34d` | gold |
| Fare/rød | `#ff5c7c` | danger |
| Kaffe-brun | `#b07a4b` | coffee |
| Te-grønn | `#4e9a51` | tea |
| Kakao-brun | `#8b5a2b` | cocoa |

Hovedstemning: mørk lilla/dyp-blå bakgrunn med neon-lilla og mynte-grønn som aksenter, gull til "premium"/seier-følelse (toppliste, merker). Dette skal gjenspeiles i fargevalg for grafikk, karuseller og bakgrunner i sosiale medier-innhold — ikke lyse, pastellfarvede "SaaS-stockbilder".

### Typografi
- Display/heading-font: pixel-font (monospace-aktig, "Courier New" fallback).
- All UI-tekst i caps/letter-spacing på knapper er typisk for merket.

### Bilder/illustrasjoner
- Pixel-art-illustrasjoner av kontormiljø (se `public/office-scene.png` som referanse: pixel-art kontorperson ved skjerm, planter, klokke på vegg, kveldslys gjennom vindu).
- Emojis brukes aktivt og bevisst i UI-tekst (☕📟🏆🎖️📊🎮⚙️) — dette er en del av tonen, ikke noe å fjerne, men skal brukes presist (ett-to relevante emoji, ikke spam).

---

## 5. Nøkkelbudskap (value props) å bygge innhold rundt

1. **Ett tapp, ferdig logget.** NFC-skanning — ingen app, ingen innlogging i farten.
2. **Hvem er kontorets koffeinkonge?** Toppliste daglig/ukentlig/totalt, per person og avdeling.
3. **Lås opp merker.** Morsomme, regelstyrte achievements (Morgenfugl, Koppmester, Kaffeholiker, Nattugle …) — admin definerer egne regler.
4. **Du eier dataene.** Selvhostet med Docker, gratis, ingen avhengighet av en tredjepart.
5. **Live statistikk** i sjarmerende pixel-stil — trender, fordeling mellom kaffe/te/kakao.
6. **Liten og personlig**, bygget av en utvikler, åpen kildekode (AGPL v3) — ikke et anonymt SaaS-selskap.
7. (Sekundært/fremtidig) **Hostet variant** for de som vil slippe oppsett — automatiske oppdateringer og backup inkludert.

---

## 6. Content-pillarer for sosiale medier

| Pillar | Beskrivelse | Eksempel-vinkler |
| --- | --- | --- |
| **Produktdemo** | Vis funksjonen i bruk | Skjermbilde/skjermopptak av NFC-tapp → kopp logget, toppliste i sanntid |
| **Kontorhumor** | Relaterbar humor om kaffekultur på jobb | "Den kollegaen som alltid er først ved kaffemaskinen mandag kl 07" |
| **Merker/achievements** | Fremhev konkrete merker som mini-historier | "Møt 'Nattugla' — merket for de som logger kopp nr. 5 etter kl 20" |
| **Bygget i åpenhet** | Indie-dev/byggelogg-vinkel for tech-publikum (mest LinkedIn) | Hvorfor selvhosting, hvorfor AGPL, designvalg bak pixel-art-UI |
| **Selvhosting/eierskap** | For tech-publikum: dataeierskap, Docker, ingen lock-in | "Ingen abonnement. Ingen sky. Dine data, din server." |
| **Sosial bevis / team-kultur** | Hvordan ekte team bruker det til å bygge kultur | Fiktive/eksempel-sitater, "avdelingen mot avdelingen"-rivalisering |

**LinkedIn**: mer teknisk/forretningsvinklet — selvhosting, eierskap til data, teamkultur, byggehistorie, "indie maker"-vinkel. Litt mer informativt, men fortsatt uformelt — ikke corporate-LinkedIn-språk.

**Instagram**: mer visuelt og lekent — pixel-art-grafikk, skjermbilder av toppliste/merker, korte humoristiske captions, kontorhverdagsvinkler. Stories/Reels kan vise "tapp og logg"-flowen.

---

## 7. Praktiske detaljer å bruke i innhold

- **Offisielt navn:** Quest of the Roasted Bean (skriv det fullt ut i hovedinnhold; "QoRB" kan brukes uformelt/internt, men ikke som primær forkortelse i markedsføring uten kontekst).
- **Domener/lenker:** Bruk kun lenker brukeren selv oppgir — ikke gjett URL-er.
- **Lisens å nevne ved behov:** AGPL v3, open source.
- **Pris å nevne ved behov:** Selvhostet = gratis. Hostet = fra $20/mnd (planlagt).
- **Eksempler på merker (kan brukes i innhold):** Første slurk 🥤, Tørst ☕, Koffeinmisbruker ⚡, Koppmester 👑, Morgenfugl 🌅, Nattugle 🦉, Allsidig 🌈, Kaffeholiker 🤎.
- **Eksempel-avdelinger (til illustrasjon, ikke ekte kundedata):** Drift & Infra, Utvikling, Servicedesk, Sikkerhet.

---

## 8. Hashtags og nøkkelord (forslag, ikke spam)

Bruk maks 3–5 relevante, ikke 20 generiske. Eksempler: `#selvhosting #docker #teamkultur #kontorhumor #opensource` (engelsk/internasjonalt: `#selfhosted #docker #devtools #teamculture`). Unngå hashtag-stuffing — det er et AI-markedsførings-tegn i seg selv.

---

## 9. Viktig: unngå "AI-språk" og "AI-utseende"

Dette er en hard regel for alt innhold som genereres til dette merket. Innhold skal virke skrevet av et menneske i teamet, ikke av en generisk AI-tekstgenerator.

### Unngå disse språkmønstrene
- Klisjé-åpninger: "I dagens digitale verden …", "Har du noen gang lurt på …", "Tenk deg en verden hvor …", "Vi er stolte av å presentere …", "Look no further", "In today's fast-paced world".
- Buzzword-fyll: "synergier", "verdiøkende", "skalerbar løsning", "game-changer", "next-level", "revolusjonerende", "unlock your potential", "elevate", "seamless", "robust", "cutting-edge", "dive into", "unleash".
- "Det er ikke bare X, det er Y"-konstruksjonen.
- Overdreven bruk av tankestreker (—) som strukturerende virkemiddel i hver setning.
- Symmetriske tre-i-rad-oppramsinger i hver setning ("raskt, enkelt og effektivt") — varier rytmen.
- For mange emoji per setning, eller emoji som ikke er en del av merkets etablerte sett (☕📟🏆🎖️📊🎮⚙️🥤⚡👑🌅🦉🌈🤎).
- Overdrevet bruk av utropstegn og "salgsspråk" (ALT CAPS, "KJØP NÅ", "IKKE GÅ GLIPP AV DETTE").
- Generiske CTA-fraser uten konkret handling ("Ta kontakt for å lære mer!" uten å si hva man faktisk gjør).
- Perfekt symmetrisk, "korrekt" grammatikk i hver eneste setning — ekte menneskelig skriving har litt variasjon i setningslengde, noen fragmenter, litt rytme.

### Gjør i stedet
- Skriv som en kollega ville skrevet en oppdatering til teamet — konkret, kort, med en knivskarp detalj (et faktisk merke-navn, et faktisk tall, en faktisk situasjon) i stedet for abstrakt skryt.
- Variér setningslengde. Bland korte konstateringer med litt lengre forklaringer.
- Bruk merkets egen humor og spillterminologi i stedet for generisk markedsføringsspråk.
- Vær konkret: "Tapp telefonen mot brikken — koppen er logget" i stedet for "Opplev en sømløs brukeropplevelse".
- Det er greit å være litt rå/uperfekt i tonen — det signalerer et ekte, lite team, ikke en markedsavdeling.

### Visuelt — unngå "AI-utseende"
- Ikke bruk generiske AI-genererte stockfoto-stilbilder (overdrevent glatte, symmetriske ansikter, "corporate diverse team smiling at laptop"-klisjeer, urealistisk perfekt belysning).
- Hold deg til merkets faktiske pixel-art/8-bit-stil og fargepalett (se kapittel 4) i stedet for fotorealistiske AI-illustrasjoner.
- Skjermbilder av faktisk produkt-UI er nesten alltid bedre enn generert illustrasjon, når formatet tillater det.
- Unngå AI-typiske layout-tics: overdrevent bruk av emoji som bullet-ikoner i Instagram-tekst, "✅ ✅ ✅"-rekker, overdrevet bruk av fet tekst på hver linje.

---

## 10. Sjekkliste før publisering

- [ ] Stemmer innholdet med tone of voice (lekent, konkret, kontorhumor — ikke corporate)?
- [ ] Er fargene/stilen i tråd med pixel-art/retro-paletten (kap. 4)?
- [ ] Er minst ett konkret produktelement nevnt (merke-navn, NFC-tapp, toppliste, etc.) i stedet for bare abstrakt skryt?
- [ ] Er klisjé-AI-fraser fra kapittel 9 fjernet?
- [ ] Riktig språk (norsk vs. engelsk) for plattform/publikum?
- [ ] Maks 3–5 relevante hashtags, ingen stuffing?
- [ ] Stemmer prisinfo/lisensinfo hvis nevnt (gratis selvhostet, ~$20/mnd hostet, AGPL v3)?
