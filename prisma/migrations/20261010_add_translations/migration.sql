-- CreateTable
CREATE TABLE "TranslationEntry" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationValue" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "draftValue" TEXT NOT NULL,
    "publishedValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TranslationEntry_key_key" ON "TranslationEntry"("key");

-- CreateIndex
CREATE INDEX "TranslationEntry_page_section_idx" ON "TranslationEntry"("page", "section");

-- CreateIndex
CREATE INDEX "TranslationEntry_sortOrder_idx" ON "TranslationEntry"("sortOrder");

-- CreateIndex
CREATE INDEX "TranslationValue_locale_idx" ON "TranslationValue"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationValue_entryId_locale_key" ON "TranslationValue"("entryId", "locale");

-- AddForeignKey
ALTER TABLE "TranslationValue" ADD CONSTRAINT "TranslationValue_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "TranslationEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
