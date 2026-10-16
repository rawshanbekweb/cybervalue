-- AlterTable
ALTER TABLE "JuniorMember" ADD COLUMN     "reportToken" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "reportToken" TEXT;

-- CreateTable
CREATE TABLE "TelegramChat" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "key" TEXT NOT NULL,
    "sentAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "TelegramChat_subject_idx" ON "TelegramChat"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramChat_chatId_subject_key" ON "TelegramChat"("chatId", "subject");

-- CreateIndex
CREATE INDEX "NotificationLog_sentAt_idx" ON "NotificationLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "JuniorMember_reportToken_key" ON "JuniorMember"("reportToken");

-- CreateIndex
CREATE UNIQUE INDEX "Student_reportToken_key" ON "Student"("reportToken");

