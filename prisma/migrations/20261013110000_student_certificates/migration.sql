-- CreateTable
CREATE TABLE "StudentCertificate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "studentId" TEXT,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT '',
    "issuedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ(3),

    CONSTRAINT "StudentCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentCertificate_code_key" ON "StudentCertificate"("code");

-- CreateIndex
CREATE INDEX "StudentCertificate_studentId_idx" ON "StudentCertificate"("studentId");

-- AddForeignKey
ALTER TABLE "StudentCertificate" ADD CONSTRAINT "StudentCertificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

