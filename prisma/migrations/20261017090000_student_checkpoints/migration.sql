-- CreateTable
CREATE TABLE "StudentCheckpoint" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "checkpoint" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentCheckpoint_checkpoint_createdAt_idx" ON "StudentCheckpoint"("checkpoint", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCheckpoint_studentId_checkpoint_seed_key" ON "StudentCheckpoint"("studentId", "checkpoint", "seed");

-- AddForeignKey
ALTER TABLE "StudentCheckpoint" ADD CONSTRAINT "StudentCheckpoint_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

