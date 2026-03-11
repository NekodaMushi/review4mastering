import { useState } from "react";
import { useRouter } from "next/navigation";

type ReviewPayload =
  | { action: "weak" | "again" | "good" }
  | { reviewInDays: number };

export function useReviewAction() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (noteId: string, payload: ReviewPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update note");
      }

      router.refresh();
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
