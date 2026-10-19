-- CreateTable
CREATE TABLE "ActivityDay" (
    "kind" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "events" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ActivityDay_pkey" PRIMARY KEY ("kind","memberId","day")
);

-- CreateIndex
CREATE INDEX "ActivityDay_day_idx" ON "ActivityDay"("day");

