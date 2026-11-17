-- AlterTable
ALTER TABLE "ClientDevelopmentBranch" ADD COLUMN     "doneByAdminId" TEXT,
ADD COLUMN     "doneSessionId" TEXT;

-- AlterTable
ALTER TABLE "ClientDevelopmentTrunk" ADD COLUMN     "beliefIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
