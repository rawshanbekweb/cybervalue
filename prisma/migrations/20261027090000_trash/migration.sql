-- CreateTable
CREATE TABLE "TrashItem" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT '',
    "data" JSONB NOT NULL,
    "files" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deletedById" TEXT,
    "deletedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrashItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrashItem_deletedAt_idx" ON "TrashItem"("deletedAt");

-- CreateIndex
CREATE INDEX "TrashItem_group_idx" ON "TrashItem"("group");

