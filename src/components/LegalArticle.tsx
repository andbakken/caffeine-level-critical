import type { LegalDoc } from "@/content/legal";

// Presentasjonskomponent for juridiske dokumenter (Vilkår, Personvern, DPA).
// Ren og lesbar prosa i appens pixel-stil.
export function LegalArticle({ doc, updatedLabel }: { doc: LegalDoc; updatedLabel: string }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-14 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="heading text-gold text-2xl sm:text-3xl leading-relaxed">{doc.title}</h1>
        <p className="text-ink-dim text-sm">
          {updatedLabel}: {doc.updated}
        </p>
        {doc.intro.map((p, i) => (
          <p key={i} className="text-ink-dim text-base leading-relaxed">
            {p}
          </p>
        ))}
      </header>

      <div className="flex flex-col gap-8">
        {doc.sections.map((s) => (
          <section key={s.heading} className="flex flex-col gap-3">
            <h2 className="font-display text-sm text-accent-2 leading-relaxed">{s.heading}</h2>
            {s.body?.map((p, i) => (
              <p key={i} className="text-ink-dim text-base leading-relaxed">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="flex flex-col gap-2">
                {s.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-ink-dim text-base leading-relaxed">
                    <span className="text-accent-2 mt-0.5">▪</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
