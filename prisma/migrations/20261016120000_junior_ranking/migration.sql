-- Junior results a student shares with their group's ranking.
ALTER TABLE "Student" ADD COLUMN "juniorXp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "juniorCodename" TEXT NOT NULL DEFAULT '',
ADD COLUMN "juniorSyncedAt" TIMESTAMPTZ(3);
