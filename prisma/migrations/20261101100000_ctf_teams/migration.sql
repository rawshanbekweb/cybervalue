-- AlterTable
ALTER TABLE "CtfPlayer" ADD COLUMN     "joinedTeamAt" TIMESTAMPTZ(3),
ADD COLUMN     "teamId" TEXT;

-- CreateTable
CREATE TABLE "CtfTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "captainId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CtfTeam_nameKey_key" ON "CtfTeam"("nameKey");

-- CreateIndex
CREATE UNIQUE INDEX "CtfTeam_inviteCode_key" ON "CtfTeam"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "CtfTeam_captainId_key" ON "CtfTeam"("captainId");

-- CreateIndex
CREATE INDEX "CtfPlayer_teamId_idx" ON "CtfPlayer"("teamId");

-- AddForeignKey
ALTER TABLE "CtfPlayer" ADD CONSTRAINT "CtfPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "CtfTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfTeam" ADD CONSTRAINT "CtfTeam_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "CtfPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
