import Link from "next/link";
import type { Metadata } from "next";
import { OfficeScene } from "@/components/OfficeScene";

export const metadata: Metadata = {
  title: "BrewQuest — gjør kaffepausen til en konkurranse",
  description:
    "Spor kaffe, te og kakao på jobben med NFC-tagger, toppliste og merker. Kjør gratis selvhostet med Docker, eller la oss hoste det for deg.",
};

const FEATURES = [
  {
    icon: "📟",
    title: "Skann og logg",
    body: "Hold telefonen mot en NFC-brikke ved kaffemaskinen — ett tapp registrerer koppen. Ingen app å installere.",
  },
  {
    icon: "🏆",
    title: "Toppliste",
    body: "Daglig, ukentlig og total rangering — per person og per avdeling. Hvem er egentlig kontorets koffeinkonge?",
  },
  {
    icon: "🎖️",
    title: "Merker",
    body: "Lås opp morsomme merker som «Morgenfugl» og «Koppmester». Admin lager og styrer reglene selv.",
  },
  {
    icon: "📊",
    title: "Statistikk",
    body: "Live dashboard med trender, fordeling mellom drikker og aktivitet over tid — i sjarmerende pixel-stil.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ---- HERO ---- */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10 grid lg:grid-cols-2 gap-10 items-center">
        <div className="flex flex-col gap-6">
          <h1 className="heading text-gold text-2xl sm:text-4xl leading-relaxed">
            Gjør kaffepausen til en konkurranse
          </h1>
          <p className="text-ink-dim text-lg sm:text-xl leading-relaxed">
            BrewQuest sporer kaffe, te og kakao for hele teamet — med NFC-skanning,
            toppliste og merker. Bygg en liten, sunn rivalisering rundt
            kaffemaskinen. ☕
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#priser" className="pixel-btn pixel-btn-gold">
              Kom i gang
            </a>
            <Link href="/" className="pixel-btn pixel-btn-ghost">
              Se demoen
            </Link>
          </div>
          <p className="text-ink-dim text-base">
            Gratis å kjøre selv · eller hostet fra $20/mnd
          </p>
        </div>

        <OfficeScene />
      </section>

      {/* ---- FUNKSJONER ---- */}
      <section id="funksjoner" className="bg-bg-2/50 border-y-[3px] border-line">
        <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col gap-8">
          <h2 className="heading text-accent-2 text-xl text-center">
            Alt teamet trenger
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="pixel-panel p-5 flex flex-col gap-3">
                <span className="text-4xl">{f.icon}</span>
                <h3 className="font-display text-sm text-gold leading-relaxed">
                  {f.title}
                </h3>
                <p className="text-ink-dim text-base leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- HVORDAN ---- */}
      <section className="max-w-6xl mx-auto px-4 py-14 flex flex-col gap-8">
        <h2 className="heading text-accent-2 text-xl text-center">
          Slik fungerer det
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { n: "1", t: "Sett opp", b: "Lag avdelinger og kaffestasjoner i admin, og fest NFC-brikker ved maskinene." },
            { n: "2", t: "Skann", b: "Folk holder telefonen mot brikken og koppen logges på sekundet." },
            { n: "3", t: "Konkurrer", b: "Følg topplista, samle merker og se statistikken vokse." },
          ].map((s) => (
            <div key={s.n} className="pixel-panel p-5 flex flex-col gap-2">
              <span className="font-display text-2xl text-gold">{s.n}</span>
              <h3 className="font-display text-sm text-accent-2">{s.t}</h3>
              <p className="text-ink-dim text-base leading-relaxed">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- PRISER ---- */}
      <section id="priser" className="bg-bg-2/50 border-y-[3px] border-line">
        <div className="max-w-5xl mx-auto px-4 py-14 flex flex-col gap-8">
          <h2 className="heading text-accent-2 text-xl text-center">
            Velg din versjon
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {/* Selvhostet */}
            <div className="pixel-panel p-6 flex flex-col gap-4">
              <h3 className="font-display text-sm text-gold">Selvhostet</h3>
              <div className="font-display text-3xl text-ink">
                Gratis
              </div>
              <p className="text-ink-dim text-base">
                Kjør det på din egen maskin eller server med Docker. Du eier dataene.
              </p>
              <ul className="flex flex-col gap-2 text-base">
                <Li>Alle funksjoner</Li>
                <Li>Ubegrenset antall brukere</Li>
                <Li>Kjører på ditt eget nett</Li>
                <Li>Fellesskaps-støtte</Li>
              </ul>
              <a href="#" className="pixel-btn pixel-btn-ghost mt-auto">
                Last ned (Docker)
              </a>
            </div>

            {/* Hostet */}
            <div className="pixel-panel p-6 flex flex-col gap-4 relative" style={{ borderColor: "var(--color-gold)" }}>
              <span className="absolute -top-3 right-4 font-display text-[0.6rem] bg-gold text-[#3a2a00] px-2 py-1">
                ANBEFALT
              </span>
              <h3 className="font-display text-sm text-gold">Hostet</h3>
              <div className="font-display text-3xl text-ink">
                $20<span className="text-lg text-ink-dim">/mnd</span>
              </div>
              <p className="text-ink-dim text-base">
                Vi tar oss av alt. Klar på minutter, med innlogging og automatiske
                oppdateringer.
              </p>
              <ul className="flex flex-col gap-2 text-base">
                <Li>Alt i selvhostet, pluss:</Li>
                <Li>Ingen oppsett eller drift</Li>
                <Li>Sikker innlogging per bruker</Li>
                <Li>Backup og oppdateringer inkludert</Li>
              </ul>
              <a href="#" className="pixel-btn pixel-btn-gold mt-auto">
                Start gratis prøveperiode
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- SLUTT-CTA ---- */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-5">
        <h2 className="heading text-gold text-xl sm:text-2xl leading-relaxed">
          Klar til å koke i gang?
        </h2>
        <p className="text-ink-dim text-lg max-w-xl">
          Sett opp BrewQuest for teamet ditt i dag — og finn ut hvem som egentlig
          holder kontoret i gang.
        </p>
        <a href="#priser" className="pixel-btn pixel-btn-gold">
          Kom i gang
        </a>
      </section>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-ink">
      <span className="text-accent-2">✔</span>
      <span className="text-ink-dim">{children}</span>
    </li>
  );
}
