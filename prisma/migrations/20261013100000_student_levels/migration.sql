-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "level" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "StudentMaterial" ADD COLUMN     "levels" TEXT[] DEFAULT ARRAY[]::TEXT[];

