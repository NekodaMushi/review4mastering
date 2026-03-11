"use client";

import { useState } from "react";

interface ReviewInControlProps {
  disabled?: boolean;
  onSubmit: (days: number) => Promise<boolean>;
}

export function ReviewInControl({
  disabled = false,
  onSubmit,
}: ReviewInControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [days, setDays] = useState("14");
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const parsedDays = Number(days);

    if (!Number.isInteger(parsedDays) || parsedDays < 1) {
      setInputError("Enter a whole number of days greater than 0.");
      return;
    }

    setInputError(null);
    const success = await onSubmit(parsedDays);

    if (success) {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => {
          setInputError(null);
          setIsOpen((prev) => !prev);
        }}
        disabled={disabled}
        className="px-4 py-2 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 disabled:opacity-50 transition-colors"
      >
        Review in
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
          <label
            htmlFor="review-in-days"
            className="text-sm font-medium text-neutral-300"
          >
            Delay in days
          </label>
          <div className="flex gap-2">
            <input
              id="review-in-days"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={days}
              onChange={(event) => setDays(event.target.value)}
              disabled={disabled}
              className="w-28 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-white outline-none transition-colors focus:border-sky-400 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled}
              className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              Confirm
            </button>
          </div>
          {inputError && <p className="text-sm text-red-400">{inputError}</p>}
        </div>
      )}
    </div>
  );
}
