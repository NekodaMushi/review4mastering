-- AlterTable
ALTER TABLE "review_history" RENAME CONSTRAINT "revision_history_pkey" TO "review_history_pkey";

-- CreateIndex
CREATE INDEX "idx_note_prochaine_review" ON "note"("next_review");

-- RenameForeignKey
ALTER TABLE "review_history" RENAME CONSTRAINT "revision_history_note_id_fkey" TO "review_history_note_id_fkey";
