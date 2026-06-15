import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produkt — Quest of the Roasted Bean",
  description:
    "Alt i Quest of the Roasted Bean: NFC-skanning, toppliste, regelstyrte merker, statistikk og full admin-kontroll. Sammenlign selvhostet og hostet.",
};

const DETAILS = [
  {
    icon: "📟",
    title: "NFC-skanning",
    body: "Fest en brikke ved hver kaffemaskin. Ett tapp med telefonen logger koppen — ingen app, ingen innlogging i farten. En brikke kan låses til én drikke, eller la brukeren velge.",
  },
  {
    icon: "🏆",
    title: "Toppliste & avdelinger",
    body: "Rangér enkeltpersoner og avdelinger — i dag, denne uka eller totalt. Perfekt for litt sunn intern rivalisering mellom teamene.",
  },
  {
    icon: "🎖️",
    title: "Regelstyrte merker",
    body: "Admin lager merker selv og setter regelen: antall kopper, ulike drikketyper, antall av én bestemt drikke, eller tidspunkt på dagen. De deles ut automatisk.",
  },
  {
    icon: "📊",
    title: "Live statistikk",
    body: "Dashboard med trender, fordeling mellom kaffe/te/kakao og aktivitet over tid — alt i sanntid og i sjarmerende pixel-stil.",
  },
  {
    icon: "🎮",
    title: "Profiler & avatarer",
    body: "Hver bruker har kallenavn, avdeling og eget bilde. Følg dine egne kopper, merker og plassering på topplista.",
  },
  {
    icon: "⚙️",
    title: "Full admin-kontroll",
    body: "Opprett avdelinger, stasjoner, NFC-tagger og merker fra ett sted. Kopier brikke-lenker rett fra admin.",
  },
];

const FAQ = [
  {
    q: "Trenger brukerne å installere en app?",
    a: "Nei. NFC-skanning åpner bare en nettside i telefonens nettleser. De som vil kan lage en profil for å samle egne merker, men man kan også logge kopper uten.",
  },
  {
    q: "Fungerer det på iPhone?",
    a: "Ja. Fordi brikkene bruker en vanlig nettlenke (URL), fungerer skanning på både iPhone og Android — uten ekstra app eller spesielle tillatelser.",
  },
  {
    q: "Hvor lagres dataene?",
    a: "I selvhostet versjon: på din egen maskin/server — du eier alt. I hostet versjon: trygt hos oss, med backup og oppdateringer inkludert.",
  },
  {
    q: "Kan vi bytte fra selvhostet til hostet senere?",
    a: "Ja. Da må de fysiske brikkene skrives om én gang fordi domenet endres, men all funksjonalitet er den samme.",
  },
];

export default function ProductPage() {
  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8 text-center flex flex-col items-center gap-5">
        <h1 className="heading text-gold text-2xl sm:text-4xl leading-relaxed">
          Hele kaffekonkurransen, i én liten app
        </h1>
        <p className="text-ink-dim text-lg sm:text-xl max-w-2xl leading-relaxed">
          Quest of the Roasted Bean gjør hverdagens kaffepauser om til et lett spill med poeng,
          merker og topplister — bygget for team som liker å konkurrere litt.
        </p>
      </section>

      {/* FUNKSJONER */}
      <section className="bg-bg-2/50 border-y-[3px] border-line">
        <div className="max-w-6xl mx-auto px-4 py-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DETAILS.map((d) => (
            <div key={d.title} className="pixel-panel p-5 flex flex-col gap-3">
              <span className="text-4xl">{d.icon}</span>
              <h3 className="font-display text-sm text-gold leading-relaxed">{d.title}</h3>
              <p className="text-ink-dim text-base leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NFC-FORKLARING */}
      <section className="max-w-5xl mx-auto px-4 py-14 flex flex-col gap-6">
        <h2 className="heading text-accent-2 text-xl text-center">
          Slik fungerer NFC-brikkene
        </h2>
        <p className="text-ink-dim text-lg text-center max-w-3xl mx-auto leading-relaxed">
          En Quest of the Roasted Bean-brikke inneholder bare en nettlenke. Telefonen åpner lenken
          ved skanning, og koppen logges på sekundet. Samme mekanisme uansett om du
          hoster selv eller lar oss gjøre det.
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="pixel-panel p-6 flex flex-col gap-3">
            <h3 className="font-display text-sm text-gold">Selvhostet</h3>
            <p className="text-ink-dim text-base leading-relaxed">
              Brikken peker på din lokale adresse på bedriftens nett, f.eks.
            </p>
            <code className="bg-[#100d22] border-[3px] border-line px-3 py-2 text-base break-all">
              http://quest-of-the-roasted-bean.lokal/t/&lt;token&gt;
            </code>
          </div>
          <div className="pixel-panel p-6 flex flex-col gap-3" style={{ borderColor: "var(--color-gold)" }}>
            <h3 className="font-display text-sm text-gold">Hostet</h3>
            <p className="text-ink-dim text-base leading-relaxed">
              Brikken peker på ditt Quest of the Roasted Bean-domene. Riktig bedrift gjenkjennes
              automatisk fra token-en:
            </p>
            <code className="bg-[#100d22] border-[3px] border-line px-3 py-2 text-base break-all">
              https://app.quest-of-the-roasted-bean.no/t/&lt;token&gt;
            </code>
          </div>
        </div>
        <p className="text-ink-dim text-base text-center max-w-3xl mx-auto leading-relaxed">
          Admin lager taggen og trykker «Kopier lenke» — som alltid bruker riktig
          domene — og skriver lenken til brikken med en gratis app som NFC Tools. En
          QR-kode med samme lenke fungerer for telefoner uten NFC.
        </p>
      </section>

      {/* SAMMENLIGNING */}
      <section className="bg-bg-2/50 border-y-[3px] border-line">
        <div className="max-w-4xl mx-auto px-4 py-14 flex flex-col gap-8">
          <h2 className="heading text-accent-2 text-xl text-center">
            Selvhostet vs. hostet
          </h2>
          <div className="pixel-panel overflow-hidden">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b-[3px] border-line bg-panel-2/60">
                  <th className="text-left p-3 font-display text-sm">&nbsp;</th>
                  <th className="p-3 font-display text-sm text-ink">Selvhostet</th>
                  <th className="p-3 font-display text-sm text-gold">Hostet</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Pris", "Gratis", "$20/mnd"],
                  ["Alle funksjoner", "✔", "✔"],
                  ["Ubegrenset brukere", "✔", "✔"],
                  ["Du eier dataene", "✔", "Hos oss"],
                  ["Oppsett & drift", "Du selv (Docker)", "Vi tar oss av det"],
                  ["Innlogging per bruker", "PIN på lokalnett", "Sikker konto"],
                  ["Backup & oppdatering", "Du selv", "Inkludert"],
                  ["Krever egen server", "Ja", "Nei"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-line/60 last:border-0">
                    <td className="p-3 text-ink-dim">{row[0]}</td>
                    <td className="p-3 text-center">{row[1]}</td>
                    <td className="p-3 text-center text-gold">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRISER */}
      <section id="priser" className="max-w-5xl mx-auto px-4 py-14 flex flex-col gap-8 w-full">
        <h2 className="heading text-accent-2 text-xl text-center">Priser</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="pixel-panel p-6 flex flex-col gap-4">
            <h3 className="font-display text-sm text-gold">Selvhostet</h3>
            <div className="font-display text-3xl text-ink">Gratis</div>
            <p className="text-ink-dim text-base">
              Kjør på egen maskin med Docker. Full kontroll og eierskap til dataene.
            </p>
            <Link href="/last-ned" className="pixel-btn pixel-btn-ghost mt-auto">
              Slik installerer du
            </Link>
          </div>
          <div className="pixel-panel p-6 flex flex-col gap-4 relative" style={{ borderColor: "var(--color-gold)" }}>
            <span className="absolute -top-3 right-4 font-display text-[0.6rem] bg-gold text-[#3a2a00] px-2 py-1">
              ANBEFALT
            </span>
            <h3 className="font-display text-sm text-gold">Hostet</h3>
            <div className="font-display text-3xl text-ink">
              $20<span className="text-lg text-ink-dim">/mnd</span>
            </div>
            <p className="text-ink-dim text-base">
              Klar på minutter. Ingen drift, sikker innlogging, backup og
              oppdateringer inkludert.
            </p>
            <a href="#" className="pixel-btn pixel-btn-gold mt-auto">
              Start gratis prøveperiode
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-bg-2/50 border-t-[3px] border-line">
        <div className="max-w-3xl mx-auto px-4 py-14 flex flex-col gap-6">
          <h2 className="heading text-accent-2 text-xl text-center">
            Ofte stilte spørsmål
          </h2>
          <div className="flex flex-col gap-3">
            {FAQ.map((f) => (
              <div key={f.q} className="pixel-panel p-5 flex flex-col gap-2">
                <h3 className="font-display text-sm text-gold leading-relaxed">{f.q}</h3>
                <p className="text-ink-dim text-base leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
