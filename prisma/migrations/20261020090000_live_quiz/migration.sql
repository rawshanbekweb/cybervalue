-- CreateTable
CREATE TABLE "LiveGame" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'lobby',
    "current" INTEGER NOT NULL DEFAULT -1,
    "seconds" INTEGER NOT NULL DEFAULT 20,
    "startedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMPTZ(3),

    CONSTRAINT "LiveGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivePlayer" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LivePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveAnswer" (
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "question" INTEGER NOT NULL,
    "choice" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "points" INTEGER NOT NULL,
    "ms" INTEGER NOT NULL,
    "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveAnswer_pkey" PRIMARY KEY ("playerId","question")
);

-- CreateIndex
CREATE INDEX "LiveGame_code_state_idx" ON "LiveGame"("code", "state");

-- CreateIndex
CREATE INDEX "LiveGame_createdAt_idx" ON "LiveGame"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LivePlayer_tokenHash_key" ON "LivePlayer"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "LivePlayer_gameId_name_key" ON "LivePlayer"("gameId", "name");

-- CreateIndex
CREATE INDEX "LiveAnswer_gameId_question_idx" ON "LiveAnswer"("gameId", "question");

-- AddForeignKey
ALTER TABLE "LivePlayer" ADD CONSTRAINT "LivePlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "LiveGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveAnswer" ADD CONSTRAINT "LiveAnswer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "LiveGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveAnswer" ADD CONSTRAINT "LiveAnswer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "LivePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

