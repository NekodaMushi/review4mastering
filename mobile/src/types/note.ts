import type { ReviewStage } from "@/types";

/** A single review note as returned by the API. */
export interface NoteRecord {
  id: string;
  user_id: string;
  name: string;
  text: string;
  link: string | null;
  current_stage: ReviewStage | null;
  created_at: Date | string | null;
  next_review: Date | string;
  last_review: Date | string | null;
  completed_at: Date | string | null;
  archived_at: Date | string | null;
  updated_at: Date | string | null;
}
