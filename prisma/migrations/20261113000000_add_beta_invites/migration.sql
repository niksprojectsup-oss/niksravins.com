-- CreateTable
CREATE TABLE "IdentityBetaInvite" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 5,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentityBetaInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdentityBetaInvite_tokenHash_key" ON "IdentityBetaInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "IdentityBetaInvite_expiresAt_idx" ON "IdentityBetaInvite"("expiresAt");

-- AddForeignKey
ALTER TABLE "IdentityBetaInvite" ADD CONSTRAINT "IdentityBetaInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
