ALTER TABLE "note"
ADD COLUMN "archived_at" TIMESTAMP(6);

CREATE INDEX "idx_note_user_archived_at" ON "note"("user_id", "archived_at");
