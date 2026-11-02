-- CreateTable
CREATE TABLE "CtfFlag" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "caseSensitive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfFlag_pkey" PRIMARY KEY ("id")
);

-- Each challenge's existing flag becomes its first accepted flag.
INSERT INTO "CtfFlag" ("id", "challengeId", "salt", "hash", "caseSensitive", "createdAt")
SELECT 'f' || md5("id" || random()::text), "id", "flagSalt", "flagHash", "caseSensitive", "createdAt"
FROM "CtfChallenge";

-- AlterTable
ALTER TABLE "CtfChallenge" DROP COLUMN "caseSensitive",
DROP COLUMN "flagHash",
DROP COLUMN "flagSalt",
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "releaseAt" TIMESTAMPTZ(3),
ADD COLUMN     "requiresId" TEXT;

-- CreateIndex
CREATE INDEX "CtfFlag_challengeId_idx" ON "CtfFlag"("challengeId");

-- AddForeignKey
ALTER TABLE "CtfChallenge" ADD CONSTRAINT "CtfChallenge_requiresId_fkey" FOREIGN KEY ("requiresId") REFERENCES "CtfChallenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfFlag" ADD CONSTRAINT "CtfFlag_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "CtfChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
