import { useTranslations } from "next-intl";
import { DemoQr } from "@/components/DemoQr";

// «Prøv uten å registrere»: QR-koden peker på demo-instansens faste brikke
// (/t/demo) — scan med mobilen, logg en ekte kopp, se deg selv på topplista.
// Seksjonen vises kun når DEMO_URL er satt (runtime-env, kun på apex), så
// markedssiden fungerer uendret til demo-tenanten er provisjonert.
// Oppsett: infra/DEMO.md.

type Step = { n: string; title: string; body: string };

export function DemoSection() {
  const demoUrl = process.env.DEMO_URL?.replace(/\/$/, "");
  if (!demoUrl) return null;
  return <DemoSectionInner demoUrl={demoUrl} />;
}

function DemoSectionInner({ demoUrl }: { demoUrl: string }) {
  const t = useTranslations("Demo");
  const steps = t.raw("steps") as Step[];

  return (
    <section className="bg-bg-2/50 border-y-[3px] border-line">
      <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col gap-8 w-full">
        <h2 className="heading text-accent-2 text-xl text-center">{t("heading")}</h2>
        <p className="text-ink-dim text-lg text-center max-w-2xl mx-auto leading-relaxed">
          {t("intro")}
        </p>

        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-4xl mx-auto w-full">
          <div className="flex flex-col items-center gap-4 text-center">
            <DemoQr url={`${demoUrl}/t/demo`} />
            <p className="text-ink-dim text-sm leading-relaxed max-w-xs">{t("qrCaption")}</p>
          </div>

          <div className="flex flex-col gap-4">
            {steps.map((s) => (
              <div key={s.n} className="pixel-panel p-4 flex items-start gap-4">
                <span className="font-display text-2xl text-gold shrink-0">{s.n}</span>
                <div>
                  <h3 className="font-display text-sm text-accent-2">{s.title}</h3>
                  <p className="text-ink-dim text-base leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
            <a
              href={`${demoUrl}/api/demo/guest?next=/leaderboard`}
              target="_blank"
              rel="noopener"
              className="pixel-btn pixel-btn-ghost self-start"
              data-umami-event="demo_open"
            >
              {t("openButton")}
            </a>
          </div>
        </div>

        <p className="text-ink-dim text-xs text-center leading-relaxed max-w-xl mx-auto">
          {t("note")}
        </p>
      </div>
    </section>
  );
}
