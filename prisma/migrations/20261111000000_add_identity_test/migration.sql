-- CreateEnum
CREATE TYPE "IdentityContentStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'DISABLED');

-- CreateEnum
CREATE TYPE "IdentityTranslationStatus" AS ENUM ('NOT_TRANSLATED', 'AUTO_TRANSLATED', 'NEEDS_REVIEW', 'APPROVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "IdentitySafetyFlag" AS ENUM ('VIOLENCE', 'SEXUAL_VIOLENCE', 'WAR', 'SEVERE_LOSS', 'SELF_HARM', 'CRISIS');

-- CreateEnum
CREATE TYPE "IdentityContentEntityType" AS ENUM ('THEME', 'SUBCATEGORY', 'BELIEF', 'TRUNK', 'BRANCH', 'MECHANISM_TAG', 'CONNECTOR', 'SAFETY_TEXT', 'CONSENT_TEXT', 'EMAIL_TEMPLATE');

-- CreateEnum
CREATE TYPE "IdentityConnectorKind" AS ENUM ('OPENING', 'JOIN_SIMILAR', 'JOIN_CONTRAST', 'TRANSITION', 'CLOSING');

-- CreateEnum
CREATE TYPE "IdentityEmailStep" AS ENUM ('RESULT', 'DAY_1', 'DAY_3', 'DAY_5');

-- CreateEnum
CREATE TYPE "IdentityEmailKind" AS ENUM ('RESULT', 'SEQUENCE_STEP', 'ADMIN_TEST');

-- CreateEnum
CREATE TYPE "IdentityDeliveryState" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "IdentitySequenceStatus" AS ENUM ('ACTIVE', 'PROCESSING', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IdentitySubmissionStatus" AS ENUM ('RECEIVED', 'VALIDATED', 'RESULT_GENERATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IdentityVersionAction" AS ENUM ('UPDATE', 'PUBLISH', 'UNPUBLISH', 'RESTORE');

-- CreateTable
CREATE TABLE "IdentityTestTheme" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "IdentityContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isSensitive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityTestTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityTestSubcategory" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "IdentityContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityTestSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityBelief" (
    "id" TEXT NOT NULL,
    "stableKey" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "IdentityContentStatus" NOT NULL DEFAULT 'DRAFT',
    "safetyFlags" "IdentitySafetyFlag"[] DEFAULT ARRAY[]::"IdentitySafetyFlag"[],
    "adminNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityBelief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityMechanismTag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "IdentityContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityMechanismTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityBeliefMechanism" (
    "beliefId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "IdentityBeliefMechanism_pkey" PRIMARY KEY ("beliefId","tagId")
);

-- CreateTable
CREATE TABLE "IdentityPositiveTrunk" (
    "id" TEXT NOT NULL,
    "beliefId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "IdentityContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityPositiveTrunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityPositiveBranch" (
    "id" TEXT NOT NULL,
    "trunkId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "IdentityContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityPositiveBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityConnector" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "kind" "IdentityConnectorKind" NOT NULL,
    "status" "IdentityContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityConnector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityContentTranslation" (
    "id" TEXT NOT NULL,
    "entityType" "IdentityContentEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "draftValue" TEXT NOT NULL DEFAULT '',
    "publishedValue" TEXT,
    "translationStatus" "IdentityTranslationStatus" NOT NULL DEFAULT 'NOT_TRANSLATED',
    "manuallyEdited" BOOLEAN NOT NULL DEFAULT false,
    "sourceVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityContentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityTestSubmission" (
    "id" TEXT NOT NULL,
    "selectedBeliefIds" TEXT[],
    "locale" TEXT NOT NULL,
    "requestId" TEXT,
    "status" "IdentitySubmissionStatus" NOT NULL DEFAULT 'RECEIVED',
    "validationNote" TEXT,
    "safetyTriggered" BOOLEAN NOT NULL DEFAULT false,
    "retainUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityTestSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityTestResult" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "portraitNow" TEXT NOT NULL,
    "portraitFuture" TEXT NOT NULL,
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "snapshot" JSONB,
    "locale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityEmailConsent" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT,
    "email" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentTextVersion" TEXT NOT NULL,
    "consentSource" TEXT NOT NULL DEFAULT 'identity-test',
    "withdrawalTimestamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityEmailConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityEmailTemplate" (
    "id" TEXT NOT NULL,
    "step" "IdentityEmailStep" NOT NULL,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "status" "IdentityContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityEmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityEmailDelivery" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "resultId" TEXT,
    "submissionId" TEXT,
    "recipient" TEXT NOT NULL,
    "recipientHash" TEXT,
    "emailKind" "IdentityEmailKind" NOT NULL,
    "step" "IdentityEmailStep",
    "status" "IdentityDeliveryState" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "processingStartedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "providerMessageId" TEXT,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityEmailDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityEmailSequence" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT,
    "consentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailHash" TEXT,
    "nextStep" "IdentityEmailStep" NOT NULL,
    "nextSendAt" TIMESTAMP(3) NOT NULL,
    "status" "IdentitySequenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "claimedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityEmailSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityContentVersion" (
    "id" TEXT NOT NULL,
    "entityType" "IdentityContentEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "previousContent" TEXT,
    "newContent" TEXT,
    "action" "IdentityVersionAction" NOT NULL DEFAULT 'UPDATE',
    "changedById" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentityContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdentityTestTheme_slug_key" ON "IdentityTestTheme"("slug");

-- CreateIndex
CREATE INDEX "IdentityTestTheme_status_sortOrder_idx" ON "IdentityTestTheme"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "IdentityTestSubcategory_themeId_sortOrder_idx" ON "IdentityTestSubcategory"("themeId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityTestSubcategory_themeId_slug_key" ON "IdentityTestSubcategory"("themeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityBelief_stableKey_key" ON "IdentityBelief"("stableKey");

-- CreateIndex
CREATE INDEX "IdentityBelief_subcategoryId_sortOrder_idx" ON "IdentityBelief"("subcategoryId", "sortOrder");

-- CreateIndex
CREATE INDEX "IdentityBelief_status_idx" ON "IdentityBelief"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityMechanismTag_key_key" ON "IdentityMechanismTag"("key");

-- CreateIndex
CREATE INDEX "IdentityBeliefMechanism_tagId_idx" ON "IdentityBeliefMechanism"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityPositiveTrunk_beliefId_key" ON "IdentityPositiveTrunk"("beliefId");

-- CreateIndex
CREATE INDEX "IdentityPositiveBranch_trunkId_sortOrder_idx" ON "IdentityPositiveBranch"("trunkId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityConnector_key_key" ON "IdentityConnector"("key");

-- CreateIndex
CREATE INDEX "IdentityContentTranslation_entityType_entityId_idx" ON "IdentityContentTranslation"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "IdentityContentTranslation_locale_translationStatus_idx" ON "IdentityContentTranslation"("locale", "translationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityContentTranslation_entityType_entityId_field_locale_key" ON "IdentityContentTranslation"("entityType", "entityId", "field", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityTestSubmission_requestId_key" ON "IdentityTestSubmission"("requestId");

-- CreateIndex
CREATE INDEX "IdentityTestSubmission_status_createdAt_idx" ON "IdentityTestSubmission"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityTestResult_submissionId_key" ON "IdentityTestResult"("submissionId");

-- CreateIndex
CREATE INDEX "IdentityTestResult_emailHash_idx" ON "IdentityTestResult"("emailHash");

-- CreateIndex
CREATE INDEX "IdentityEmailConsent_emailHash_idx" ON "IdentityEmailConsent"("emailHash");

-- CreateIndex
CREATE INDEX "IdentityEmailConsent_submissionId_idx" ON "IdentityEmailConsent"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityEmailTemplate_step_key" ON "IdentityEmailTemplate"("step");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityEmailDelivery_requestId_key" ON "IdentityEmailDelivery"("requestId");

-- CreateIndex
CREATE INDEX "IdentityEmailDelivery_status_createdAt_idx" ON "IdentityEmailDelivery"("status", "createdAt");

-- CreateIndex
CREATE INDEX "IdentityEmailDelivery_resultId_idx" ON "IdentityEmailDelivery"("resultId");

-- CreateIndex
CREATE INDEX "IdentityEmailDelivery_submissionId_idx" ON "IdentityEmailDelivery"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityEmailSequence_submissionId_key" ON "IdentityEmailSequence"("submissionId");

-- CreateIndex
CREATE INDEX "IdentityEmailSequence_status_nextSendAt_idx" ON "IdentityEmailSequence"("status", "nextSendAt");

-- CreateIndex
CREATE INDEX "IdentityEmailSequence_consentId_idx" ON "IdentityEmailSequence"("consentId");

-- CreateIndex
CREATE INDEX "IdentityContentVersion_entityType_entityId_changedAt_idx" ON "IdentityContentVersion"("entityType", "entityId", "changedAt");

-- AddForeignKey
ALTER TABLE "IdentityTestSubcategory" ADD CONSTRAINT "IdentityTestSubcategory_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "IdentityTestTheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityBelief" ADD CONSTRAINT "IdentityBelief_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "IdentityTestSubcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityBeliefMechanism" ADD CONSTRAINT "IdentityBeliefMechanism_beliefId_fkey" FOREIGN KEY ("beliefId") REFERENCES "IdentityBelief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityBeliefMechanism" ADD CONSTRAINT "IdentityBeliefMechanism_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "IdentityMechanismTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityPositiveTrunk" ADD CONSTRAINT "IdentityPositiveTrunk_beliefId_fkey" FOREIGN KEY ("beliefId") REFERENCES "IdentityBelief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityPositiveBranch" ADD CONSTRAINT "IdentityPositiveBranch_trunkId_fkey" FOREIGN KEY ("trunkId") REFERENCES "IdentityPositiveTrunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityTestResult" ADD CONSTRAINT "IdentityTestResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "IdentityTestSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityEmailConsent" ADD CONSTRAINT "IdentityEmailConsent_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "IdentityTestSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityEmailDelivery" ADD CONSTRAINT "IdentityEmailDelivery_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "IdentityTestResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityEmailDelivery" ADD CONSTRAINT "IdentityEmailDelivery_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "IdentityTestSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityEmailSequence" ADD CONSTRAINT "IdentityEmailSequence_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "IdentityTestSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityEmailSequence" ADD CONSTRAINT "IdentityEmailSequence_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "IdentityEmailConsent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityContentVersion" ADD CONSTRAINT "IdentityContentVersion_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

