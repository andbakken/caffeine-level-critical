import { getTranslations } from "next-intl/server";
import { getGlobalCups } from "@/lib/globalStats";

// «Social proof» på landingssiden: totalt antall loggede kopper på tvers av alle
// hostede instanser. Vises alltid på den hostede markedssiden — også når totalen er 0.
// Skjules KUN når tallet ikke er tilgjengelig (dev/selvhostet eller control-plane nede),
// dvs. når getGlobalCups() returnerer null. En ekte 0 skal vises.
export async function CupCounter() {
  const cups = await getGlobalCups();
  if (cups === null) return null;

  const t = await getTranslations("Landing");
  return (
    <section className="border-y-[3px] border-line bg-panel-2/40">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col items-center gap-2 text-center">
        <p className="font-display text-3xl sm:text-4xl text-gold leading-relaxed">
          {t("cupsCounted", { count: cups })}
        </p>
        <p className="text-ink-dim text-xs leading-relaxed max-w-md">{t("cupsNote")}</p>
      </div>
    </section>
  );
}
