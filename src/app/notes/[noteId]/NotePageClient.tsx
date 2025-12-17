"use client";

import { note } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { getReviewStatus } from "@/lib/utils/review";
import { useReviewAction } from "@/lib/hooks/useReviewAction";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

interface NotePageClientProps {
  note: note;
}

export function NotePageClient({ note }: NotePageClientProps) {
  const router = useRouter();
  const reviewStatus = getReviewStatus(note.next_review, note.current_stage);
  const { handleAction, loading, error } = useReviewAction();
  const isFirstStage = (note.current_stage || "TEN_MINUTES") === "TEN_MINUTES";
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonClick = async (action: "weak" | "again" | "good") => {
    setActiveButton(action);
    await handleAction(note.id, action);
    setActiveButton(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={() => router.push("/notes")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to notes</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold">{note.name}</h1>
            <span
              className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${reviewStatus.bgColor} ${reviewStatus.textColor}`}
            >
              {reviewStatus.label}
            </span>
          </div>

          <div className="mb-4">
            <span
              className={`text-sm ${
                reviewStatus.isDue
                  ? "text-green-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              {reviewStatus.dateText}
            </span>
          </div>

          {note.text && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 dark:text-gray-300">{note.text}</p>
            </div>
          )}

          {note.link && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Link</h2>
              <a
                href={note.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {note.link}
              </a>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded mb-4">
              {error}
            </div>
          )}

          {reviewStatus.showReviewButtons && (
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => handleButtonClick("weak")}
                disabled={loading || isFirstStage}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title={isFirstStage ? "Cannot go back from first stage" : ""}
              >
                {loading && activeButton === "weak" ? (
                  <Spinner className="text-white" />
                ) : null}
                Weak
              </button>

              <button
                onClick={() => handleButtonClick("again")}
                disabled={loading}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600
                           disabled:opacity-50 flex items-center gap-2"
              >
                {loading && activeButton === "again" ? (
                  <Spinner className="text-white" />
                ) : null}
                Again
              </button>

              <button
                onClick={() => handleButtonClick("good")}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600
                           disabled:opacity-50 flex items-center gap-2"
              >
                {loading && activeButton === "good" ? (
                  <Spinner className="text-white" />
                ) : null}
                Good
              </button>
            </div>
          )}

          {!reviewStatus.showReviewButtons && (
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-700 dark:text-blue-300">
                This note is not due for review yet. Come back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
