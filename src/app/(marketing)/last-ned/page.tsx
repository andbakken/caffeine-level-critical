import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Last ned & installer — BrewQuest",
  description:
    "Kjør BrewQuest gratis på din egen maskin med Docker. Alle avhengigheter er inkludert — følg de fem stegene.",
};

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-[#100d22] border-[3px] border-line p-4 text-base overflow-x-auto whitespace-pre leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pixel-panel p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="font-display text-2xl text-gold">{n}</span>
        <h2 className="font-display text-sm text-accent-2 leading-relaxed">{title}</h2>
      </div>
      <div className="flex flex-col gap-3 text-ink-dim text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-8">
      <header className="text-center flex flex-col gap-4">
        <h1 className="heading text-gold text-2xl sm:text-3xl leading-relaxed">
          Last ned & installer
        </h1>
        <p className="text-ink-dim text-lg leading-relaxed">
          Kjør BrewQuest gratis på din egen maskin eller server. Docker pakker{" "}
          <span className="text-ink">alt</span> — app, database (PostgreSQL) og alle
          avhengigheter. Du trenger ikke installere Node, en database eller noe annet.
        </p>
      </header>

      <div className="pixel-panel p-4 text-base text-ink-dim" style={{ borderColor: "var(--color-accent-2)" }}>
        ✅ <span className="text-ink">Eneste krav:</span> Docker. Resten kommer
        ferdig i pakken.
      </div>

      <Step n="1" title="Installer Docker">
        <p>Docker kjører hele appen i isolerte «containere». Installer det først:</p>
        <ul className="flex flex-col gap-2">
          <li>
            <span className="text-ink">Windows / Mac:</span> last ned{" "}
            <a
              href="https://www.docker.com/products/docker-desktop/"
              className="text-accent-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Docker Desktop
            </a>{" "}
            og kjør installasjonsprogrammet.
          </li>
          <li>
            <span className="text-ink">Linux:</span> installer{" "}
            <a
              href="https://docs.docker.com/engine/install/"
              className="text-accent-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Docker Engine
            </a>{" "}
            med pakkebehandleren din.
          </li>
        </ul>
        <p>Sjekk at det virker:</p>
        <Code>docker --version</Code>
      </Step>

      <Step n="2" title="Hent BrewQuest">
        <p>Last ned siste utgave og pakk den ut, eller hent den med git:</p>
        <Code>{`git clone https://github.com/brewquest/brewquest.git
cd brewquest`}</Code>
        <p className="text-sm">
          (Foretrekker du uten git? Last ned ZIP-en fra utgivelsessiden og pakk den
          ut i en mappe.)
        </p>
      </Step>

      <Step n="3" title="Sett opp konfigurasjon">
        <p>
          Kopier eksempelfila til <span className="text-ink">.env</span> og juster
          ved behov (port og admin-PIN for første innlogging):
        </p>
        <Code>cp .env.example .env</Code>
        <p>Eksempel på innhold:</p>
        <Code>{`# Port appen skal kjøre på
PORT=3000

# Første admin-bruker (lages ved oppstart)
ADMIN_NICKNAME=GameMaster
ADMIN_PIN=1234

# Database-passord (kan stå som det er for lokal kjøring)
POSTGRES_PASSWORD=brewquest`}</Code>
      </Step>

      <Step n="4" title="Start alt med ett kommando">
        <p>
          Denne kommandoen starter både appen og databasen, kjører
          databaseoppsettet automatisk og legger inn standard drikker og merker:
        </p>
        <Code>docker compose up -d</Code>
        <p>
          Første gang laster den ned bildene — det tar et par minutter. Senere
          starter den på sekunder.
        </p>
      </Step>

      <Step n="5" title="Åpne og logg inn">
        <p>
          Gå til{" "}
          <code className="bg-[#100d22] border-[3px] border-line px-2 py-1">
            http://localhost:3000
          </code>{" "}
          i nettleseren. Logg inn som admin med kallenavnet og PIN-en fra{" "}
          <span className="text-ink">.env</span>, og lag dine egne avdelinger,
          stasjoner og NFC-tagger under <span className="text-ink">Admin</span>.
        </p>
        <p>
          Skal kollegene nå appen fra mobilen? Bruk maskinens adresse på nettet,
          f.eks.{" "}
          <code className="bg-[#100d22] border-[3px] border-line px-2 py-1">
            http://192.168.1.20:3000
          </code>
          .
        </p>
      </Step>

      {/* NFC */}
      <div className="pixel-panel p-6 flex flex-col gap-3">
        <h2 className="font-display text-sm text-gold">Koble opp NFC-brikkene</h2>
        <p className="text-ink-dim text-base leading-relaxed">
          Lag en tagg i admin, trykk <span className="text-ink">«Kopier lenke»</span>,
          og skriv lenken til brikken med en gratis app som{" "}
          <span className="text-ink">NFC Tools</span> (velg «Skriv» → «URL/URI»). Da
          logger ett tapp koppen direkte. En QR-kode med samme lenke fungerer for
          telefoner uten NFC.
        </p>
      </div>

      {/* Vedlikehold */}
      <div className="pixel-panel p-6 flex flex-col gap-4">
        <h2 className="font-display text-sm text-gold">Vedlikehold</h2>
        <div className="flex flex-col gap-2 text-ink-dim text-base">
          <p className="text-ink">Oppdater til nyeste versjon:</p>
          <Code>{`docker compose pull
docker compose up -d`}</Code>
          <p className="text-ink">Ta sikkerhetskopi av databasen:</p>
          <Code>docker compose exec db pg_dump -U brewquest brewquest &gt; backup.sql</Code>
          <p className="text-ink">Stopp appen:</p>
          <Code>docker compose down</Code>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center flex flex-col items-center gap-4 py-4">
        <p className="text-ink-dim text-lg">
          Vil du heller slippe oppsett og drift?
        </p>
        <Link href="/produkt#priser" className="pixel-btn pixel-btn-gold">
          Se den hostede versjonen
        </Link>
      </div>

      <p className="text-center text-ink-dim text-sm leading-relaxed">
        Merk: instruksjonene gjelder den ferdigpakkede Docker-utgaven, som kommer i
        neste steg av prosjektet.
      </p>
    </div>
  );
}
