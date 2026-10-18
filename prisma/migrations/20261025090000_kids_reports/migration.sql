-- AlterTable
ALTER TABLE "KidsMember" ADD COLUMN     "juniorId" TEXT,
ADD COLUMN     "reportToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "KidsMember_reportToken_key" ON "KidsMember"("reportToken");

-- CreateIndex
CREATE UNIQUE INDEX "KidsMember_juniorId_key" ON "KidsMember"("juniorId");

