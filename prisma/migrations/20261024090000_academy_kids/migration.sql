-- CreateTable
CREATE TABLE "KidsMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "codeHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "progress" JSONB NOT NULL DEFAULT '{}',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMPTZ(3),
    "lastActiveAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KidsMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidsSession" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KidsSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KidsMember_codeHash_key" ON "KidsMember"("codeHash");

-- CreateIndex
CREATE INDEX "KidsMember_group_idx" ON "KidsMember"("group");

-- CreateIndex
CREATE INDEX "KidsMember_xp_idx" ON "KidsMember"("xp");

-- CreateIndex
CREATE UNIQUE INDEX "KidsSession_tokenHash_key" ON "KidsSession"("tokenHash");

-- CreateIndex
CREATE INDEX "KidsSession_memberId_idx" ON "KidsSession"("memberId");

-- AddForeignKey
ALTER TABLE "KidsSession" ADD CONSTRAINT "KidsSession_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "KidsMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

