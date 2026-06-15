import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TapClient } from "@/components/TapClient";

export const dynamic = "force-dynamic";

export default async function TapPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const tag = await prisma.stationTag.findUnique({
    where: { token },
    include: { station: true, drink: true },
  });

  if (!tag) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-6xl mb-4">🤖💥</p>
        <h1 className="heading text-danger text-lg">Ukjent tagg</h1>
        <p className="text-ink-dim mt-3">Denne NFC-taggen er ikke registrert i BrewQuest.</p>
        <Link href="/" className="pixel-btn mt-6 inline-block">
          Til dashboard
        </Link>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/t/${token}`)}`);

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
