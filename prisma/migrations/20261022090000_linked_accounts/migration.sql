-- AlterTable
ALTER TABLE "HtmlCandidate" ADD COLUMN     "accountId" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "bonusXp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "juniorId" TEXT;

-- AlterTable
ALTER TABLE "StudentCertificate" ADD COLUMN     "rule" TEXT;

-- CreateIndex
CREATE INDEX "HtmlCandidate_accountId_idx" ON "HtmlCandidate"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_juniorId_key" ON "Student"("juniorId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCertificate_studentId_rule_key" ON "StudentCertificate"("studentId", "rule");

