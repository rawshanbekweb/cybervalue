-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "groups" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'owner';

