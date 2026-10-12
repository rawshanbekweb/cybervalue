-- AlterTable
ALTER TABLE "StudentMaterial" ADD COLUMN     "timeLimit" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StudentQuizStart" (
    "studentId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentQuizStart_pkey" PRIMARY KEY ("studentId","materialId")
);

-- CreateIndex
CREATE INDEX "StudentQuizStart_materialId_idx" ON "StudentQuizStart"("materialId");

-- AddForeignKey
ALTER TABLE "StudentQuizStart" ADD CONSTRAINT "StudentQuizStart_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentQuizStart" ADD CONSTRAINT "StudentQuizStart_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "StudentMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
