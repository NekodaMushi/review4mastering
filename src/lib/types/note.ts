import type { note } from "@prisma/client";

export type NoteRecord = note & {
  archived_at?: Date | string | null;
};
