
ALTER TABLE "note" ADD COLUMN IF NOT EXISTS "next_review" TIMESTAMP(6);
ALTER TABLE "note" ADD COLUMN IF NOT EXISTS "last_review" TIMESTAMP(6);


UPDATE "note" SET "next_review" = "next_revision" WHERE "next_review" IS NULL;
UPDATE "note" SET "last_review" = "last_revision" WHERE "last_review" IS NOT NULL AND "last_review" IS NULL;


ALTER TABLE "note" ALTER COLUMN "next_review" SET NOT NULL;

DO $$
BEGIN
  IF to_regclass('public.revision_history') IS NOT NULL THEN
    ALTER TABLE "revision_history" RENAME TO "review_history";
  END IF;
END $$;


DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RevisionStage') THEN
    ALTER TYPE "RevisionStage" RENAME TO "ReviewStage";
  END IF;
END $$;


DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_note_prochaine_revision') THEN
    ALTER INDEX "idx_note_prochaine_revision" RENAME TO "idx_note_prochaine_review";
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_revision_history_note_id') THEN
    ALTER INDEX "idx_revision_history_note_id" RENAME TO "idx_review_history_note_id";
  END IF;
END $$;


ALTER TABLE "note" DROP COLUMN IF EXISTS "next_revision";
ALTER TABLE "note" DROP COLUMN IF EXISTS "last_revision";
