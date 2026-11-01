-- CreateTable
CREATE TABLE "CtfPlayer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "usernameKey" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMPTZ(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMPTZ(3),

    CONSTRAINT "CtfPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtfSession" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtfToken" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "usedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CtfPlayer_email_key" ON "CtfPlayer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CtfPlayer_usernameKey_key" ON "CtfPlayer"("usernameKey");

-- CreateIndex
CREATE INDEX "CtfPlayer_createdAt_idx" ON "CtfPlayer"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CtfSession_tokenHash_key" ON "CtfSession"("tokenHash");

-- CreateIndex
CREATE INDEX "CtfSession_playerId_idx" ON "CtfSession"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "CtfToken_tokenHash_key" ON "CtfToken"("tokenHash");

-- CreateIndex
CREATE INDEX "CtfToken_playerId_kind_idx" ON "CtfToken"("playerId", "kind");

-- AddForeignKey
ALTER TABLE "CtfSession" ADD CONSTRAINT "CtfSession_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "CtfPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfToken" ADD CONSTRAINT "CtfToken_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "CtfPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
