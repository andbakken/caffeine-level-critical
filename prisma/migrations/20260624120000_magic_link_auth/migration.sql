-- AlterTable: e-post + valgfri PIN på User
ALTER TABLE "User" ADD COLUMN "email" TEXT;
ALTER TABLE "User" ALTER COLUMN "pinHash" DROP NOT NULL;

-- CreateTable: engangs magic-link-token (id = sha256 av råtoken)
CREATE TABLE "LoginToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "LoginToken_userId_idx" ON "LoginToken"("userId");

-- AddForeignKey
ALTER TABLE "LoginToken" ADD CONSTRAINT "LoginToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
