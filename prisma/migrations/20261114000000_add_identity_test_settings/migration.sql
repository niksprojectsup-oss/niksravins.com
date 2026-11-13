-- CreateTable
CREATE TABLE "IdentityTestSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "publicAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityTestSettings_pkey" PRIMARY KEY ("id")
);
