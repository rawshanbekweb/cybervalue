-- CreateTable
CREATE TABLE "LinuxIpAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMPTZ(3) NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "leaves" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMPTZ(3),
    "finishReason" TEXT,
    "grading" JSONB,
    "autoScore" DOUBLE PRECISION,
    "overrides" JSONB NOT NULL DEFAULT '{}',
    "finalScore" DOUBLE PRECISION,
    "note" TEXT NOT NULL DEFAULT '',
    "approvedAt" TIMESTAMPTZ(3),
    "approvedBy" TEXT,

    CONSTRAINT "LinuxIpAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinuxIpAttempt_studentId_key" ON "LinuxIpAttempt"("studentId");

-- CreateIndex
CREATE INDEX "LinuxIpAttempt_submittedAt_idx" ON "LinuxIpAttempt"("submittedAt");

-- AddForeignKey
ALTER TABLE "LinuxIpAttempt" ADD CONSTRAINT "LinuxIpAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
