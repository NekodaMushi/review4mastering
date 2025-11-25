"use client";

import { note, ReviewStage } from "@prisma/client";
import { useState } from "react";

const stageLabels: Record<ReviewStage, string> = {
  TEN_MINUTES: "10 minutes",
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !note) return null;

  const currentStage = note.current_stage || "TEN_MINUTES";
  const isFirstStage = currentStage === "TEN_MINUTES";
  const stageColor = stageBgColor[currentStage];
  const stageLabel = stageLabels[currentStage];

  const handleAction = async (action: "weak" | "again" | "good") => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update note");
      }

      onActionComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{note.name}</h2>
          <span
            className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${stageColor}`}
          >
            {stageLabel}
          </span>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            Description
          </h3>
          <p className="text-gray-800 text-lg leading-relaxed mb-4">
            {note.text}
          </p>

          {note.link && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Link</h3>
              <a
                href={note.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
              >
                {note.link}
              </a>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded mb-4">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-50"
          >
            Close
          </button>

          <button
            onClick={() => handleAction("weak")}
            disabled={loading || isFirstStage}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title={isFirstStage ? "Cannot go back from first stage" : ""}
          >
            Weak
          </button>

          <button
            onClick={() => handleAction("again")}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600
                       disabled:opacity-50"
          >
            Again
          </button>

          <button
            onClick={() => handleAction("good")}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600
                       disabled:opacity-50"
          >
            Good
          </button>
        </div>
      </div>
    </div>
  );
}
