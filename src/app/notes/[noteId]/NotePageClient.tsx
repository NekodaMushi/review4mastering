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
    <div className="relative min-h-screen bg-neutral-950 text-white overflow-hidden py-8">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-3xl">
        <button
          onClick={() => router.push("/notes")}
          className="mb-6 flex items-center gap-2 text-neutral-500 hover:text-amber-400 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to notes</span>
        </button>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="font-[family-name:var(--font-sora)] text-3xl font-bold">
              {note.name}
            </h1>
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
                  ? "text-amber-400 font-semibold"
                  : "text-neutral-500"
              }`}
            >
              {reviewStatus.dateText}
            </span>
          </div>

          {note.text && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-neutral-400 mb-2">Description</h2>
              <p className="text-neutral-300">{note.text}</p>
            </div>
          )}

          {note.link && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-neutral-400 mb-2">Link</h2>
              <a
                href={note.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 hover:underline transition-colors"
              >
                {note.link}
              </a>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {reviewStatus.showReviewButtons && (
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => handleButtonClick("weak")}
                disabled={loading || isFirstStage}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                title={isFirstStage ? "Cannot go back from first stage" : ""}
              >
                {loading && activeButton === "weak" ? (
                  <Spinner className="text-red-400" />
                ) : null}
                Weak
              </button>

              <button
                onClick={() => handleButtonClick("again")}
                disabled={loading}
                className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30
                           disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading && activeButton === "again" ? (
                  <Spinner className="text-amber-400" />
                ) : null}
                Again
              </button>

              <button
                onClick={() => handleButtonClick("good")}
                disabled={loading}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30
                           disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading && activeButton === "good" ? (
                  <Spinner className="text-emerald-400" />
                ) : null}
                Good
              </button>
            </div>
          )}

          {!reviewStatus.showReviewButtons && (
            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-400/80">
                This note is not due for review yet. Come back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
