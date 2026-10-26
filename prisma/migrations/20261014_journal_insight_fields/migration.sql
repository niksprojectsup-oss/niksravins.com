CREATE TYPE "JournalCategory" AS ENUM ('PATTERN', 'TRIGGER', 'POSITIVE_OBSERVATION');

ALTER TABLE "ClientJournalEntry"
ADD COLUMN "category" "JournalCategory",
ADD COLUMN "observedOn" TEXT;

CREATE INDEX "ClientJournalEntry_clientId_category_idx" ON "ClientJournalEntry"("clientId", "category");
