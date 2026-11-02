-- CreateTable
CREATE TABLE "CtfAward" (
    "id" TEXT NOT NULL,
    "entrantId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfAward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CtfAward_entrantId_idx" ON "CtfAward"("entrantId");

-- AddForeignKey
ALTER TABLE "CtfAward" ADD CONSTRAINT "CtfAward_entrantId_fkey" FOREIGN KEY ("entrantId") REFERENCES "CtfEntrant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
