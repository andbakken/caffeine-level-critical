import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { WorkspaceFinder } from "@/components/WorkspaceFinder";
import { marketingMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

// «Finn arbeidsområdet ditt»: apex har ingen egen kundeinnlogging – bedrifter
// logger inn på sitt eget subdomene (slug.<domene>). Denne siden sender dem dit.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Workspace" });
  return marketingMetadata(locale, "logg-inn", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default function WorkspaceLoginPage() {
  const t = useTranslations("Workspace");

  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-6">
      <div className="pixel-panel p-6 flex flex-col gap-4">
        <h1 className="heading text-gold text-xl">{t("title")}</h1>
        <p className="text-ink-dim text-base leading-relaxed">{t("intro")}</p>
        <WorkspaceFinder />
      </div>

      <div className="pixel-panel p-6 flex flex-col gap-3">
        <p className="text-ink-dim text-base leading-relaxed">{t("noWorkspace")}</p>
        <Link href="/kom-i-gang" className="pixel-btn pixel-btn-ghost self-start">
          {t("getStartedCta")}
        </Link>
      </div>
    </div>
  );
}
