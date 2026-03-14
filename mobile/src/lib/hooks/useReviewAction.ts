import { useState } from "react";
import { API_BASE_URL, authHeaders } from "@/lib/auth-client";

type ReviewPayload =
  | { action: "weak" | "again" | "good" }
  | { reviewInDays: number };

export function useReviewAction(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (noteId: string, payload: ReviewPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: "PATCH",
        headers: await authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update note");
      }

      onSuccess?.();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleAction, loading, error };
}
