-- CreateTable
CREATE TABLE "DomainExamAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMPTZ(3) NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "leaves" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMPTZ(3),
    "finishReason" TEXT,
    "score" INTEGER,
    "total" INTEGER,
    "note" TEXT NOT NULL DEFAULT '',
    "approvedAt" TIMESTAMPTZ(3),
    "approvedBy" TEXT,

    CONSTRAINT "DomainExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DomainExamAttempt_studentId_domain_key" ON "DomainExamAttempt"("studentId", "domain");

-- CreateIndex
CREATE INDEX "DomainExamAttempt_domain_submittedAt_idx" ON "DomainExamAttempt"("domain", "submittedAt");

-- AddForeignKey
ALTER TABLE "DomainExamAttempt" ADD CONSTRAINT "DomainExamAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
