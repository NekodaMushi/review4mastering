"use client";

import { note } from "@prisma/client";
import { stageLabels, stageBgColor } from "@/lib/constants/noteStages";
import { useReviewAction } from "@/lib/hooks/useReviewAction";

interface ReviewNoteProps {
  note: note | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: () => void;
}

export function ReviewNote({
  note,
  isOpen,
  onClose,
  onActionComplete,
}: ReviewNoteProps) {
  const { handleAction, loading, error } = useReviewAction();

  if (!isOpen || !note) return null;

  const currentStage = note.current_stage || "TEN_MINUTES";
  const isFirstStage = currentStage === "TEN_MINUTES";
  const stageColor = stageBgColor[currentStage];
  const stageLabel = stageLabels[currentStage];

  const handleButtonClick = async (action: "weak" | "again" | "good") => {
    const success = await handleAction(note.id, action);
    if (success) {
      onActionComplete();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-[family-name:var(--font-sora)] text-3xl font-bold text-white mb-2">
            {note.name}
          </h2>
          <span
            className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${stageColor}`}
          >
            {stageLabel}
          </span>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-neutral-500 mb-2">
            Description
          </h3>
          <p className="text-neutral-300 text-lg leading-relaxed mb-4">
            {note.text}
          </p>

          {note.link && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 mb-2">Link</h3>
              <a
                href={note.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 hover:underline break-all transition-colors"
              >
                {note.link}
              </a>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => handleButtonClick("weak")}
            disabled={loading || isFirstStage}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={isFirstStage ? "Cannot go back from first stage" : ""}
          >
            {loading ? "..." : "Weak"}
          </button>

          <button
            onClick={() => handleButtonClick("again")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30
                       disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : "Again"}
          </button>

          <button
            onClick={() => handleButtonClick("good")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30
                       disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : "Good"}
          </button>
        </div>
      </div>
    </div>
  );
}
