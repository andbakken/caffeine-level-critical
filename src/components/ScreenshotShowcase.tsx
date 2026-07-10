import Image from "next/image";
import { useTranslations } from "next-intl";

// «Vis, ikke fortell»: ekte skjermbilder fra appen, innrammet som pixel-CRT-er.
// Bildene tas fra en seedet demo-instans med scripts/marketing-screenshots.mjs
// og ligger i public/screenshots/. Deles av landingssiden og /produkt.

type Shot = { caption: string; alt: string };

function Screen({
  src,
  shot,
  width,
  height,
  sizes,
}: {
  src: string;
  shot: Shot;
  width: number;
  height: number;
  sizes: string;
}) {
  return (
    <figure className="pixel-screen scroll-pop flex flex-col">
      <div className="flex items-center gap-1.5 pb-2" aria-hidden>
        <span className="w-2 h-2 bg-danger" />
        <span className="w-2 h-2 bg-gold" />
        <span className="w-2 h-2 bg-accent-2" />
      </div>
      <div className="relative overflow-hidden">
        <Image src={src} alt={shot.alt} width={width} height={height} sizes={sizes} />
        {/* Subtile CRT-scanlinjer over selve «skjermen» */}
        <div className="absolute inset-0 pointer-events-none pixel-scanlines" aria-hidden />
      </div>
      <figcaption className="text-ink-dim text-sm leading-relaxed pt-3">
        {shot.caption}
      </figcaption>
    </figure>
  );
}

export function ScreenshotShowcase() {
  const t = useTranslations("Screens");
  const leaderboard = t.raw("leaderboard") as Shot;
  const dashboard = t.raw("dashboard") as Shot;
  const badges = t.raw("badges") as Shot;

  return (
    <section className="max-w-6xl mx-auto px-4 py-14 flex flex-col gap-8 w-full">
      <h2 className="heading text-accent-2 text-xl text-center">{t("heading")}</h2>
      <p className="text-ink-dim text-lg text-center max-w-2xl mx-auto leading-relaxed">
        {t("intro")}
      </p>
      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Screen
            src="/screenshots/leaderboard.png"
            shot={leaderboard}
            width={2200}
            height={1600}
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          <Screen
            src="/screenshots/dashboard.png"
            shot={dashboard}
            width={2200}
            height={1600}
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
        </div>
        <div className="max-w-xs mx-auto lg:mx-0 w-full">
          <Screen
            src="/screenshots/merker.png"
            shot={badges}
            width={840}
            height={1720}
            sizes="(max-width: 1024px) 80vw, 20rem"
          />
        </div>
      </div>
    </section>
  );
}
