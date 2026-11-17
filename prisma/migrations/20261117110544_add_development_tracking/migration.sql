-- CreateEnum
CREATE TYPE "IdentitySubmissionLinkStatus" AS ENUM ('UNLINKED', 'LINKED', 'REVIEW');

-- CreateEnum
CREATE TYPE "IdentitySubmissionLinkMethod" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "DevelopmentTrunkOrigin" AS ENUM ('LIBRARY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DevelopmentTrunkStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NEEDS_SUPPLEMENT');

-- AlterTable
ALTER TABLE "IdentityTestSubmission" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "linkMethod" "IdentitySubmissionLinkMethod",
ADD COLUMN     "linkStatus" "IdentitySubmissionLinkStatus" NOT NULL DEFAULT 'UNLINKED',
ADD COLUMN     "linkedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BeliefLibraryTheme" (
    "id" TEXT NOT NULL,
    "libraryKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "titleLv" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL DEFAULT '',
    "descriptionLv" TEXT NOT NULL DEFAULT '',
    "exploreQuestions" TEXT NOT NULL DEFAULT '',
    "professionalNotes" TEXT NOT NULL DEFAULT '',
    "isSensitive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeliefLibraryTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeliefLibraryTrunk" (
    "id" TEXT NOT NULL,
    "libraryKey" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "titleLv" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL DEFAULT '',
    "negativeBelief" TEXT NOT NULL DEFAULT '',
    "status" "IdentityContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeliefLibraryTrunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeliefLibraryBranch" (
    "id" TEXT NOT NULL,
    "trunkId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "textLv" TEXT NOT NULL,
    "textEn" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeliefLibraryBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeliefTrunkLink" (
    "id" TEXT NOT NULL,
    "beliefId" TEXT NOT NULL,
    "trunkId" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeliefTrunkLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientDevelopmentTrunk" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "libraryTrunkId" TEXT,
    "beliefId" TEXT,
    "origin" "DevelopmentTrunkOrigin" NOT NULL DEFAULT 'LIBRARY',
    "titleLv" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL DEFAULT '',
    "status" "DevelopmentTrunkStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "sessionId" TEXT,
    "completedSessionId" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedByAdminId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientDevelopmentTrunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientDevelopmentBranch" (
    "id" TEXT NOT NULL,
    "clientTrunkId" TEXT NOT NULL,
    "libraryBranchId" TEXT,
    "textLv" TEXT NOT NULL,
    "textEn" TEXT NOT NULL DEFAULT '',
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientDevelopmentBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientDevelopmentEvent" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "trunkId" TEXT,
    "branchId" TEXT,
    "action" TEXT NOT NULL,
    "prevStatus" TEXT,
    "newStatus" TEXT,
    "detail" TEXT NOT NULL DEFAULT '',
    "actorAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientDevelopmentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BeliefLibraryTheme_libraryKey_key" ON "BeliefLibraryTheme"("libraryKey");

-- CreateIndex
CREATE UNIQUE INDEX "BeliefLibraryTrunk_libraryKey_key" ON "BeliefLibraryTrunk"("libraryKey");

-- CreateIndex
CREATE INDEX "BeliefLibraryTrunk_themeId_sortOrder_idx" ON "BeliefLibraryTrunk"("themeId", "sortOrder");

-- CreateIndex
CREATE INDEX "BeliefLibraryBranch_trunkId_sortOrder_idx" ON "BeliefLibraryBranch"("trunkId", "sortOrder");

-- CreateIndex
CREATE INDEX "BeliefTrunkLink_trunkId_idx" ON "BeliefTrunkLink"("trunkId");

-- CreateIndex
CREATE UNIQUE INDEX "BeliefTrunkLink_beliefId_trunkId_key" ON "BeliefTrunkLink"("beliefId", "trunkId");

-- CreateIndex
CREATE INDEX "ClientDevelopmentTrunk_clientId_status_idx" ON "ClientDevelopmentTrunk"("clientId", "status");

-- CreateIndex
CREATE INDEX "ClientDevelopmentTrunk_completedSessionId_idx" ON "ClientDevelopmentTrunk"("completedSessionId");

-- CreateIndex
CREATE INDEX "ClientDevelopmentBranch_clientTrunkId_sortOrder_idx" ON "ClientDevelopmentBranch"("clientTrunkId", "sortOrder");

-- CreateIndex
CREATE INDEX "ClientDevelopmentEvent_clientId_createdAt_idx" ON "ClientDevelopmentEvent"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "IdentityTestSubmission_clientId_linkStatus_idx" ON "IdentityTestSubmission"("clientId", "linkStatus");

-- AddForeignKey
ALTER TABLE "IdentityTestSubmission" ADD CONSTRAINT "IdentityTestSubmission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeliefLibraryTrunk" ADD CONSTRAINT "BeliefLibraryTrunk_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "BeliefLibraryTheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeliefLibraryBranch" ADD CONSTRAINT "BeliefLibraryBranch_trunkId_fkey" FOREIGN KEY ("trunkId") REFERENCES "BeliefLibraryTrunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeliefTrunkLink" ADD CONSTRAINT "BeliefTrunkLink_beliefId_fkey" FOREIGN KEY ("beliefId") REFERENCES "IdentityBelief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeliefTrunkLink" ADD CONSTRAINT "BeliefTrunkLink_trunkId_fkey" FOREIGN KEY ("trunkId") REFERENCES "BeliefLibraryTrunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDevelopmentTrunk" ADD CONSTRAINT "ClientDevelopmentTrunk_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDevelopmentTrunk" ADD CONSTRAINT "ClientDevelopmentTrunk_libraryTrunkId_fkey" FOREIGN KEY ("libraryTrunkId") REFERENCES "BeliefLibraryTrunk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDevelopmentTrunk" ADD CONSTRAINT "ClientDevelopmentTrunk_beliefId_fkey" FOREIGN KEY ("beliefId") REFERENCES "IdentityBelief"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDevelopmentTrunk" ADD CONSTRAINT "ClientDevelopmentTrunk_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDevelopmentTrunk" ADD CONSTRAINT "ClientDevelopmentTrunk_completedSessionId_fkey" FOREIGN KEY ("completedSessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDevelopmentBranch" ADD CONSTRAINT "ClientDevelopmentBranch_clientTrunkId_fkey" FOREIGN KEY ("clientTrunkId") REFERENCES "ClientDevelopmentTrunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDevelopmentBranch" ADD CONSTRAINT "ClientDevelopmentBranch_libraryBranchId_fkey" FOREIGN KEY ("libraryBranchId") REFERENCES "BeliefLibraryBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDevelopmentEvent" ADD CONSTRAINT "ClientDevelopmentEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
