-- CreateTable
CREATE TABLE "OrgProfile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "logoPath" TEXT,
    "posterHeading" TEXT,
    "posterBody" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgProfile_pkey" PRIMARY KEY ("id")
);
