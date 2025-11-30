"use client";

import { note } from "@prisma/client";
import { useAvatarColor } from "@/hooks/useAvatorColor";
import { getReviewStatus } from "@/lib/utils/review";

interface NoteCardProps {
  note: note;
}

export function NoteCard({ note }: NoteCardProps) {
  const reviewStatus = getReviewStatus(note.next_review, note.current_stage);
  const avatarColor = useAvatarColor(note.id);
  const avatarLetter = note.name.charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
      <div className="flex gap-3 mb-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
          style={{ backgroundColor: avatarColor }}
        >
          {avatarLetter}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {note.name}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${reviewStatus.bgColor} ${reviewStatus.textColor}`}
            >
              {reviewStatus.label}
            </span>
          </div>

          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{note.text}</p>

          {note.link && (
            <a
              href={note.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm hover:underline mb-3 block truncate"
            >
              {note.link}
            </a>
          )}

          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              Created: {new Date(note.created_at!).toLocaleDateString()}
            </span>

            <span
              className={
                reviewStatus.isDue ? "text-green-600 font-semibold" : ""
              }
            >
              {reviewStatus.dateText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
