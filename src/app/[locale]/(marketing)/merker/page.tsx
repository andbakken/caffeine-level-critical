import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DEFAULT_ACHIEVEMENTS, type AchievementDef } from "@/content/achievements";
import { marketingMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

// Merkegalleriet: alle standard-merkene som samlekort. Viser dybden i
// gamifiseringen (den reelle differensiatoren mot «bare en teller») og gir en
// delbar URL. Data kommer statisk fra src/content/achievements.ts — ingen DB.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Badges" });
  return marketingMetadata(locale, "merker", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

type Rarity = "common" | "rare" | "epic" | "legendary";

/** Ren markedsførings-kategorisering av hvor hardt merket er å få — brukes kun
 *  til fargekoding i galleriet, finnes ikke i produktet. */
function rarity(a: AchievementDef): Rarity {
  const t = a.threshold;
  switch (a.ruleType) {
    case "total":
      return t >= 500 ? "legendary" : t >= 100 ? "epic" : t >= 50 ? "rare" : "common";
    case "streak":
      return t >= 30 ? "legendary" : t >= 10 ? "epic" : t >= 5 ? "rare" : "common";
    case "longest_streak":
      return "epic";
    case "day_total":
      return t >= 10 ? "epic" : t >= 5 ? "rare" : "common";
    case "before_hour":
      return t <= 6 ? "epic" : "rare";
    case "after_hour":
      return t >= 23 ? "epic" : "rare";
    case "drink":
    case "distinct_station":
    case "distinct_tag":
    case "hour_slots":
      return "rare";
    case "drink_each":
    case "tag_total":
    case "active_days":
      return "epic";
    case "distinct":
      return a.threshold >= 5 ? "rare" : "common";
    default:
      return "common";
  }
}

const RARITY_CLASS: Record<Rarity, string> = {
  common: "badge-rarity-common",
  rare: "badge-rarity-rare",
  epic: "badge-rarity-epic",
  legendary: "badge-rarity-legendary",
};

export default function BadgeGalleryPage() {
  const t = useTranslations("Badges");
  const badges = [...DEFAULT_ACHIEVEMENTS].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-10">
      <header className="text-center flex flex-col items-center gap-4">
        <p className="heading text-accent-2 text-xs sm:text-sm tracking-widest uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="heading text-gold text-2xl sm:text-3xl leading-relaxed">
          {t("title", { count: badges.length })}
        </h1>
        <p className="text-ink-dim text-lg max-w-2xl leading-relaxed">{t("intro")}</p>
        <p className="text-ink-dim text-sm max-w-xl leading-relaxed">{t("flipHint")}</p>
      </header>

      {/* Sjeldenhets-legende */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
        {(["common", "rare", "epic", "legendary"] as const).map((r) => (
          <span key={r} className="flex items-center gap-2 text-ink-dim">
            <span className={`w-3 h-3 inline-block ${RARITY_CLASS[r]}-swatch`} aria-hidden />
            {t(`rarity.${r}`)}
          </span>
        ))}
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 list-none">
        {badges.map((b) => {
          const r = rarity(b);
          return (
            <li key={b.key} className="badge-card-wrap scroll-pop">
              {/* tabindex gjør flippen tilgjengelig med tastatur og på touch (fokus). */}
              <div
                className={`badge-card ${RARITY_CLASS[r]}`}
                tabIndex={0}
                aria-label={`${b.name}: ${b.description}`}
              >
                <div className="badge-face badge-front pixel-panel">
                  <span className="badge-icon" aria-hidden>
                    {b.icon}
                  </span>
                  <span className="font-display text-xs text-gold leading-relaxed">
                    {b.name}
                  </span>
                  <span className={`badge-rarity ${RARITY_CLASS[r]}-chip`}>
                    {t(`rarity.${r}`)}
                  </span>
                </div>
                <div className="badge-face badge-back pixel-panel" aria-hidden>
                  <span className="font-display text-[0.6rem] text-accent-2 uppercase tracking-widest">
                    {t("ruleLabel")}
                  </span>
                  <span className="text-ink text-sm leading-relaxed">{b.description}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="text-center flex flex-col items-center gap-4 py-4">
        <p className="text-ink-dim text-lg max-w-xl leading-relaxed">{t("adminNote")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/kom-i-gang"
            className="pixel-btn pixel-btn-gold"
            data-umami-event="cta_badges"
          >
            {t("cta")}
          </Link>
          <Link href="/produkt" className="pixel-btn pixel-btn-ghost">
            {t("backToProduct")}
          </Link>
        </div>
      </div>
    </div>
  );
}
