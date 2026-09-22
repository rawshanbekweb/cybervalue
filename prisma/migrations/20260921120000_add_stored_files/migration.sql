CREATE TABLE "StoredFile" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoredFile_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "StoredFile_kind_check" CHECK ("kind" IN ('RESOURCE', 'IMAGE')),
    CONSTRAINT "StoredFile_size_check" CHECK ("size" > 0 AND "size" <= 4194304)
);
CREATE UNIQUE INDEX "StoredFile_path_key" ON "StoredFile"("path");
CREATE INDEX "StoredFile_kind_createdAt_idx" ON "StoredFile"("kind", "createdAt");
