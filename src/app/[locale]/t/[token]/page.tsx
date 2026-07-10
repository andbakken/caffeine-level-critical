import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/demo";
import { Link } from "@/i18n/navigation";
import { TapClient } from "@/components/TapClient";

export const dynamic = "force-dynamic";

// NFC-token-sider er private engangslenker – aldri i søkeresultater.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function TapPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const tag = await prisma.stationTag.findUnique({
    where: { token },
    include: { station: true, drink: true },
  });

  if (!tag) {
    const t = await getTranslations("Tap");
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-6xl mb-4">🤖💥</p>
        <h1 className="heading text-danger text-lg">{t("unknownTagTitle")}</h1>
        <p className="text-ink-dim mt-3">{t("unknownTagBody")}</p>
        <Link href="/dashboard" className="pixel-btn mt-6 inline-block">
          {t("toDashboard")}
        </Link>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    // Demo-instansen: hopp over innlogging — besøkende får en anonym
    // gjestebruker automatisk (se /api/demo/guest) og lander rett tilbake her.
    if (DEMO_MODE) redirect(`/api/demo/guest?next=${encodeURIComponent(`/t/${token}`)}`);
    redirect(`/login?next=${encodeURIComponent(`/t/${token}`)}`);
  }

  const drinks = await prisma.drink.findMany({ orderBy: { sortOrder: "asc" } });
  const drinkList = drinks.map((d) => ({
    key: d.key,
    displayName: d.displayName,
    icon: d.icon,
    color: d.color,
  }));

  const fixedDrink = tag.drink
    ? {
        key: tag.drink.key,
        displayName: tag.drink.displayName,
        icon: tag.drink.icon,
        color: tag.drink.color,
      }
    : null;

  return (
    <TapClient
      token={token}
      stationName={tag.station.name}
      fixedDrink={fixedDrink}
      drinks={drinkList}
      nickname={user.nickname}
    />
  );
}
