import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgProfile } from "@/lib/orgProfile";
import { APP_NAME } from "@/lib/brand";
import { PosterClient } from "@/components/PosterClient";

export const dynamic = "force-dynamic";

export default async function PosterPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [tag, profile] = await Promise.all([
    prisma.stationTag.findUnique({
      where: { token },
      include: { station: true, drink: true },
    }),
    getOrgProfile(),
  ]);

  if (!tag) notFound();

  return (
    <PosterClient
      token={tag.token}
      stationName={tag.station.name}
      stationLocation={tag.station.location}
      tagLabel={tag.label}
      drinkName={tag.drink?.displayName ?? null}
      appName={APP_NAME}
      logoPath={profile.logoPath}
      heading={profile.posterHeading}
      body={profile.posterBody}
    />
  );
}
