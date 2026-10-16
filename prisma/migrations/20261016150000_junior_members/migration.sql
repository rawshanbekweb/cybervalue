-- Cybervalue Academy Junior gets its own accounts (code sign-in, progress
-- kept on the server). The student-side Junior ranking columns are replaced.
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "juniorCodename",
DROP COLUMN "juniorSyncedAt",
DROP COLUMN "juniorXp";

-- CreateTable
CREATE TABLE "JuniorMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "codeHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMPTZ(3),
    "codename" TEXT NOT NULL DEFAULT '',
    "progress" JSONB NOT NULL DEFAULT '{}',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMPTZ(3),
    "lastActiveAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JuniorMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuniorSession" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JuniorSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JuniorMember_codeHash_key" ON "JuniorMember"("codeHash");

-- CreateIndex
CREATE INDEX "JuniorMember_group_idx" ON "JuniorMember"("group");

-- CreateIndex
CREATE INDEX "JuniorMember_xp_idx" ON "JuniorMember"("xp");

-- CreateIndex
CREATE UNIQUE INDEX "JuniorSession_tokenHash_key" ON "JuniorSession"("tokenHash");

-- CreateIndex
CREATE INDEX "JuniorSession_memberId_idx" ON "JuniorSession"("memberId");

-- AddForeignKey
ALTER TABLE "JuniorSession" ADD CONSTRAINT "JuniorSession_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "JuniorMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

