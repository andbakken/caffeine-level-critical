import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { hostedPrice } from "@/lib/pricing";
import type { Locale } from "@/i18n/routing";

// Priskortene (selvhostet + hostet) — delt mellom landingssiden og /priser,
// så innholdet aldri spriker. Tekstene bor i Landing-navnerommet.
export function PricingCards() {
  const t = useTranslations("Landing");
  const locale = useLocale() as Locale;
  const price = hostedPrice(locale);

  const selfHostedBullets = t.raw("selfHostedBullets") as string[];
  const hostedBullets = t.raw("hostedBullets") as string[];

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {/* Selvhostet */}
      <div className="pixel-panel p-6 flex flex-col gap-4">
        <h3 className="font-display text-sm text-gold">{t("selfHostedTitle")}</h3>
        <div className="font-display text-3xl text-ink">{t("free")}</div>
        <p className="text-ink-dim text-base">{t("selfHostedBody")}</p>
        <ul className="flex flex-col gap-2 text-base">
          {selfHostedBullets.map((b) => (
            <Li key={b}>{b}</Li>
          ))}
        </ul>
        <Link href="/last-ned" className="pixel-btn pixel-btn-ghost mt-auto">
          {t("downloadDocker")}
        </Link>
      </div>

      {/* Hostet */}
      <div
        className="pixel-panel p-6 flex flex-col gap-4 relative"
        style={{ borderColor: "var(--color-gold)" }}
      >
        <span className="absolute -top-3 right-4 font-display text-[0.6rem] bg-gold text-[#3a2a00] px-2 py-1">
          {t("recommended")}
        </span>
        <h3 className="font-display text-sm text-gold">{t("hostedTitle")}</h3>
        <div className="font-display text-3xl text-ink">
          {price.amount}
          <span className="text-lg text-ink-dim">{price.period}</span>
        </div>
        <p className="text-ink-dim text-base">{t("hostedBody")}</p>
        <ul className="flex flex-col gap-2 text-base">
          {hostedBullets.map((b) => (
            <Li key={b}>{b}</Li>
          ))}
        </ul>
        <Link
          href="/kom-i-gang"
          className="pixel-btn pixel-btn-gold mt-auto"
          data-umami-event="cta_pricing"
        >
          {t("startTrial")}
        </Link>
        <p className="text-ink-dim text-xs leading-relaxed text-center">{t("trialNote")}</p>
      </div>
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
