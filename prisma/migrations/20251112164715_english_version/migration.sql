/*
  Warnings:

  - You are about to drop the column `derniere_revision` on the `note` table. All the data in the column will be lost.
  - You are about to drop the column `prochaine_revision` on the `note` table. All the data in the column will be lost.
  - You are about to drop the column `stade_actuel` on the `note` table. All the data in the column will be lost.
  - You are about to drop the column `ancien_stade` on the `revision_history` table. All the data in the column will be lost.
  - You are about to drop the column `nouveau_stade` on the `revision_history` table. All the data in the column will be lost.
  - Added the required column `next_revision` to the `note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_stage` to the `revision_history` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action_type` on the `revision_history` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('weak', 'again', 'good');

-- CreateEnum
CREATE TYPE "RevisionStage" AS ENUM ('10_minutes', '1_day', '7_days', '1_month', '3_months', '1_year', '2_years', '5_years', 'COMPLETED');

-- DropIndex
DROP INDEX "idx_note_prochaine_revision";

-- DropIndex
DROP INDEX "idx_note_stade_actuel";

-- AlterTable
ALTER TABLE "note" DROP COLUMN "derniere_revision",
DROP COLUMN "prochaine_revision",
DROP COLUMN "stade_actuel",
ADD COLUMN     "current_stage" "RevisionStage" DEFAULT '10_minutes',
ADD COLUMN     "last_revision" TIMESTAMP(6),
ADD COLUMN     "next_revision" TIMESTAMP(6) NOT NULL;

-- AlterTable
ALTER TABLE "revision_history" DROP COLUMN "ancien_stade",
DROP COLUMN "nouveau_stade",
ADD COLUMN     "new_stage" "RevisionStage" NOT NULL,
ADD COLUMN     "old_stage" "RevisionStage",
DROP COLUMN "action_type",
ADD COLUMN     "action_type" "ActionType" NOT NULL;

-- DropEnum
DROP TYPE "action_type";

-- DropEnum
DROP TYPE "stade_revision";

-- CreateIndex
CREATE INDEX "idx_note_prochaine_revision" ON "note"("next_revision");

-- CreateIndex
CREATE INDEX "idx_note_stade_actuel" ON "note"("current_stage");
