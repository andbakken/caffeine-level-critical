import Image from "next/image";
import { useTranslations } from "next-intl";

// Sosial bevisføring som high-score-liste: sitater fra pilotkontorer stylet
// som arcade-innslag — pixel-avatar, initialer i AAA-stil, koppetall og sitat.
//
// ⚠️ Innholdet i messages («Testimonials.entries») er PLASSHOLDERE fra
// pilotbruk og må byttes/bekreftes med ekte, godkjente sitater før de brukes
// i produksjon. Seksjonen forsvinner helt hvis entries-listen tømmes.

type Entry = {
  initials: string;
  who: string;
  cups: number;
  quote: string;
  avatar: string;
};

const MEDALS = ["🥇", "🥈", "🥉"];

export function Testimonials() {
  const t = useTranslations("Testimonials");
  const entries = t.raw("entries") as Entry[];
  if (!entries?.length) return null;

  return (
    <section className="bg-bg-2/50 border-y-[3px] border-line">
      <div className="max-w-4xl mx-auto px-4 py-14 flex flex-col gap-8 w-full">
        <h2 className="heading text-accent-2 text-xl text-center">{t("heading")}</h2>
        <div className="flex flex-col gap-3">
          {entries.map((e, i) => (
            <figure key={e.initials} className="pixel-panel p-4 sm:p-5 scroll-pop">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-xl sm:text-2xl shrink-0" aria-hidden>
                  {MEDALS[i] ?? "🏅"}
                </span>
                <Image
                  src={`/avatars/preset/${e.avatar}`}
                  alt=""
                  width={40}
                  height={40}
                  className="w-10 h-10 border-2 border-line shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <figcaption className="font-display text-xs text-gold leading-relaxed truncate">
                    {e.initials} · {e.who}
                  </figcaption>
                  <p className="font-body text-lg text-accent-2 leading-tight">
                    {t("cups", { count: e.cups })}
                  </p>
                </div>
              </div>
              <blockquote className="text-ink-dim text-base leading-relaxed mt-3 border-l-[3px] border-line pl-3">
                «{e.quote}»
              </blockquote>
            </figure>
          ))}
        </div>
        <p className="text-ink-dim text-xs text-center leading-relaxed">{t("note")}</p>
      </div>
    </section>
  );
}
