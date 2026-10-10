-- AlterEnum
ALTER TYPE "MaterialKind" ADD VALUE 'CHALLENGE';

-- AlterTable
ALTER TABLE "StudentMaterial" ADD COLUMN     "artifact" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "artifactName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "secret" TEXT;

