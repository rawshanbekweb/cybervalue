CREATE TABLE "HtmlExam" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "minutes" INTEGER NOT NULL DEFAULT 45 CHECK ("minutes" BETWEEN 15 AND 120),
  "version" INTEGER NOT NULL DEFAULT 1,
  "closed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "HtmlCandidate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "examId" TEXT NOT NULL REFERENCES "HtmlExam"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "studentId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "sessionHash" TEXT,
  "variant" INTEGER NOT NULL,
  "startedAt" TIMESTAMP(3),
  "deadline" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "finishReason" TEXT,
  "revision" INTEGER NOT NULL DEFAULT 0,
  "code" TEXT NOT NULL DEFAULT '',
  "answers" JSONB NOT NULL DEFAULT '{}',
  "explanations" JSONB NOT NULL DEFAULT '["", ""]',
  "signals" JSONB NOT NULL DEFAULT '{"hidden":0,"paste":0,"fullscreen":0}',
  "autoScore" INTEGER CHECK ("autoScore" BETWEEN 0 AND 90),
  "grading" JSONB,
  "reviewScore" INTEGER CHECK ("reviewScore" BETWEEN 0 AND 10),
  "reviewNote" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "HtmlCandidate_codeHash_key" ON "HtmlCandidate"("codeHash");
CREATE UNIQUE INDEX "HtmlCandidate_sessionHash_key" ON "HtmlCandidate"("sessionHash");
CREATE UNIQUE INDEX "HtmlCandidate_examId_studentId_key" ON "HtmlCandidate"("examId", "studentId");
CREATE INDEX "HtmlCandidate_examId_submittedAt_idx" ON "HtmlCandidate"("examId", "submittedAt");
