"use client";

import { note, ReviewStage } from "@prisma/client";
import { useAvatarColor } from "@/hooks/useAvatorColor";

const stageLabels: Record<ReviewStage, string> = {
  TEN_MINUTES: "10 min",
  ONE_DAY: "1 day",
  SEVEN_DAYS: "7 days",
  ONE_MONTH: "1 month",
  THREE_MONTHS: "3 months",
  ONE_YEAR: "1 year",
  TWO_YEARS: "2 years",
  FIVE_YEARS: "5 years",
  COMPLETED: "Completed",
};

const stageBgColor: Record<ReviewStage, string> = {
  TEN_MINUTES: "bg-red-100 text-red-800",
  ONE_DAY: "bg-orange-100 text-orange-800",
  SEVEN_DAYS: "bg-yellow-100 text-yellow-800",
  ONE_MONTH: "bg-blue-100 text-blue-800",
  THREE_MONTHS: "bg-purple-100 text-purple-800",
  ONE_YEAR: "bg-indigo-100 text-indigo-800",
  TWO_YEARS: "bg-pink-100 text-pink-800",
  FIVE_YEARS: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
};

interface NoteCardProps {
  note: note;
}

export function NoteCard({ note }: NoteCardProps) {
  const stageColor = stageBgColor[note.current_stage || "TEN_MINUTES"];
  const stageLabel = stageLabels[note.current_stage || "TEN_MINUTES"];
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
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${stageColor}`}
            >
              {stageLabel}
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
            <span>
              Review: {new Date(note.next_review).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
