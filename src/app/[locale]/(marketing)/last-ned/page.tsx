import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { marketingMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Download" });
  return marketingMetadata(locale, "last-ned", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-[#100d22] border-[3px] border-line p-4 text-base overflow-x-auto whitespace-pre leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pixel-panel p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="font-display text-2xl text-gold">{n}</span>
        <h2 className="font-display text-sm text-accent-2 leading-relaxed">{title}</h2>
      </div>
      <div className="flex flex-col gap-3 text-ink-dim text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
}

const bold = (chunks: React.ReactNode) => <span className="text-ink">{chunks}</span>;
const inlineCode = (chunks: React.ReactNode) => (
  <code className="bg-[#100d22] border-[3px] border-line px-2 py-1">{chunks}</code>
);

export default function DownloadPage() {
  const t = useTranslations("Download");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-8">
      <header className="text-center flex flex-col gap-4">
        <h1 className="heading text-gold text-2xl sm:text-3xl leading-relaxed">
          {t("title")}
        </h1>
        <p className="text-ink-dim text-lg leading-relaxed">
          {t.rich("intro", { b: bold })}
        </p>
      </header>

      <div className="pixel-panel p-4 text-base text-ink-dim" style={{ borderColor: "var(--color-accent-2)" }}>
        {t.rich("onlyReq", { b: bold })}
      </div>

      <Step n="1" title={t("step1Title")}>
        <p>{t("step1Intro")}</p>
        <ul className="flex flex-col gap-2">
          <li>
            {t.rich("step1Win", {
              b: bold,
              link: (chunks) => (
                <a
                  href="https://www.docker.com/products/docker-desktop/"
                  className="text-accent-2 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {chunks}
                </a>
              ),
            })}
          </li>
          <li>
            {t.rich("step1Linux", {
              b: bold,
              link: (chunks) => (
                <a
                  href="https://docs.docker.com/engine/install/"
                  className="text-accent-2 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {chunks}
                </a>
              ),
            })}
          </li>
        </ul>
        <p>{t("step1Check")}</p>
        <Code>docker --version</Code>
      </Step>

      <Step n="2" title={t("step2Title")}>
        <p>{t("step2Intro")}</p>
        <Code>{`git clone https://github.com/andbakken/quest-of-the-roasted-bean.git
cd quest-of-the-roasted-bean`}</Code>
        <p className="text-sm">{t("step2Zip")}</p>
      </Step>

      <Step n="3" title={t("step3Title")}>
        <p>{t.rich("step3Intro", { code: inlineCode })}</p>
        <Code>cp .env.example .env</Code>
        <p>{t("step3Example")}</p>
        <Code>{t("step3EnvExample")}</Code>
      </Step>

      <Step n="4" title={t("step4Title")}>
        <p>{t("step4Intro")}</p>
        <Code>docker compose up -d</Code>
        <p>{t("step4Note")}</p>
      </Step>

      <Step n="5" title={t("step5Title")}>
        <p>{t.rich("step5Body1", { b: bold, code: inlineCode })}</p>
        <p>{t.rich("step5Body2", { code: inlineCode })}</p>
      </Step>

      {/* NFC */}
      <div className="pixel-panel p-6 flex flex-col gap-3">
        <h2 className="font-display text-sm text-gold">{t("nfcTitle")}</h2>
        <p className="text-ink-dim text-base leading-relaxed">
          {t.rich("nfcBody", { b: bold })}
        </p>
      </div>

      {/* Vedlikehold */}
      <div className="pixel-panel p-6 flex flex-col gap-4">
        <h2 className="font-display text-sm text-gold">{t("maintTitle")}</h2>
        <div className="flex flex-col gap-2 text-ink-dim text-base">
          <p className="text-ink">{t("maintUpdate")}</p>
          <Code>{`docker compose pull
docker compose up -d`}</Code>
          <p className="text-ink">{t("maintBackup")}</p>
          <Code>docker compose exec db pg_dump -U quest-of-the-roasted-bean quest-of-the-roasted-bean &gt; backup.sql</Code>
          <p className="text-ink">{t("maintStop")}</p>
          <Code>docker compose down</Code>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center flex flex-col items-center gap-4 py-4">
        <p className="text-ink-dim text-lg">{t("ctaQuestion")}</p>
        <Link href="/produkt#priser" className="pixel-btn pixel-btn-gold">
          {t("ctaButton")}
        </Link>
      </div>

      <p className="text-center text-ink-dim text-sm leading-relaxed">{t("footnote")}</p>
    </div>
  );
}
