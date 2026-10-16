-- CreateTable
CREATE TABLE "StudentLabProgress" (
    "studentId" TEXT NOT NULL,
    "lab" TEXT NOT NULL,
    "lessons" INTEGER[],
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "StudentLabProgress_pkey" PRIMARY KEY ("studentId","lab")
);

-- AddForeignKey
ALTER TABLE "StudentLabProgress" ADD CONSTRAINT "StudentLabProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

