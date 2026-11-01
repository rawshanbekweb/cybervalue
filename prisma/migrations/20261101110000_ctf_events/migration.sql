-- CreateTable
CREATE TABLE "CtfEvent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "registrationEndsAt" TIMESTAMPTZ(3),
    "maxTeamSize" INTEGER NOT NULL DEFAULT 4,
    "allowSolo" BOOLEAN NOT NULL DEFAULT true,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "freezeAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtfEntrant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teamId" TEXT,
    "playerId" TEXT,
    "name" TEXT NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfEntrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtfChallenge" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "flagSalt" TEXT NOT NULL,
    "flagHash" TEXT NOT NULL,
    "caseSensitive" BOOLEAN NOT NULL DEFAULT true,
    "initialPoints" INTEGER NOT NULL DEFAULT 500,
    "minimumPoints" INTEGER NOT NULL DEFAULT 100,
    "decay" INTEGER NOT NULL DEFAULT 20,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtfFile" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtfHint" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CtfHint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtfHintUnlock" (
    "entrantId" TEXT NOT NULL,
    "hintId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfHintUnlock_pkey" PRIMARY KEY ("entrantId","hintId")
);

-- CreateTable
CREATE TABLE "CtfSolve" (
    "id" TEXT NOT NULL,
    "entrantId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "playerId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfSolve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtfSubmission" (
    "id" TEXT NOT NULL,
    "entrantId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "playerId" TEXT,
    "correct" BOOLEAN NOT NULL,
    "valueHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtfAnnouncement" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtfAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CtfEvent_slug_key" ON "CtfEvent"("slug");

-- CreateIndex
CREATE INDEX "CtfEvent_published_startsAt_idx" ON "CtfEvent"("published", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "CtfEntrant_eventId_teamId_key" ON "CtfEntrant"("eventId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "CtfEntrant_eventId_playerId_key" ON "CtfEntrant"("eventId", "playerId");

-- CreateIndex
CREATE INDEX "CtfChallenge_eventId_position_idx" ON "CtfChallenge"("eventId", "position");

-- CreateIndex
CREATE INDEX "CtfFile_challengeId_idx" ON "CtfFile"("challengeId");

-- CreateIndex
CREATE INDEX "CtfHint_challengeId_idx" ON "CtfHint"("challengeId");

-- CreateIndex
CREATE INDEX "CtfSolve_challengeId_createdAt_idx" ON "CtfSolve"("challengeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CtfSolve_entrantId_challengeId_key" ON "CtfSolve"("entrantId", "challengeId");

-- CreateIndex
CREATE INDEX "CtfSubmission_entrantId_challengeId_createdAt_idx" ON "CtfSubmission"("entrantId", "challengeId", "createdAt");

-- CreateIndex
CREATE INDEX "CtfSubmission_challengeId_valueHash_idx" ON "CtfSubmission"("challengeId", "valueHash");

-- CreateIndex
CREATE INDEX "CtfAnnouncement_eventId_createdAt_idx" ON "CtfAnnouncement"("eventId", "createdAt");

-- AddForeignKey
ALTER TABLE "CtfEntrant" ADD CONSTRAINT "CtfEntrant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CtfEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfEntrant" ADD CONSTRAINT "CtfEntrant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "CtfTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfEntrant" ADD CONSTRAINT "CtfEntrant_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "CtfPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfChallenge" ADD CONSTRAINT "CtfChallenge_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CtfEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfFile" ADD CONSTRAINT "CtfFile_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "CtfChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfHint" ADD CONSTRAINT "CtfHint_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "CtfChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfHintUnlock" ADD CONSTRAINT "CtfHintUnlock_entrantId_fkey" FOREIGN KEY ("entrantId") REFERENCES "CtfEntrant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfHintUnlock" ADD CONSTRAINT "CtfHintUnlock_hintId_fkey" FOREIGN KEY ("hintId") REFERENCES "CtfHint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfSolve" ADD CONSTRAINT "CtfSolve_entrantId_fkey" FOREIGN KEY ("entrantId") REFERENCES "CtfEntrant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfSolve" ADD CONSTRAINT "CtfSolve_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "CtfChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfSolve" ADD CONSTRAINT "CtfSolve_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "CtfPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfSubmission" ADD CONSTRAINT "CtfSubmission_entrantId_fkey" FOREIGN KEY ("entrantId") REFERENCES "CtfEntrant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfSubmission" ADD CONSTRAINT "CtfSubmission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "CtfChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfSubmission" ADD CONSTRAINT "CtfSubmission_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "CtfPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtfAnnouncement" ADD CONSTRAINT "CtfAnnouncement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CtfEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
