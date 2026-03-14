import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { stageLabels, stageColors } from "@/lib/constants/noteStages";
import { useReviewAction } from "@/lib/hooks/useReviewAction";
import { useAuth } from "@/lib/hooks/useAuth";
import { ReviewInControl } from "@/components/ReviewInControl";
import { ReviewStage } from "@/types";
import type { NoteRecord } from "@/types/note";
import { API_BASE_URL, authHeaders } from "@/lib/auth-client";

function getReviewStatus(
  nextReviewDate: Date | string,
  currentStage: ReviewStage | null
) {
  const now = new Date();
  const reviewDate = new Date(nextReviewDate);
  const isDue = reviewDate <= now;
  const fallbackStage = currentStage || ReviewStage.TEN_MINUTES;

  if (isDue) {
    return {
      isDue: true,
      label: "Due now!",
      colors: stageColors[fallbackStage],
      dateText: `Next review: ${reviewDate.toLocaleDateString()}`,
      showReviewButtons: true,
    };
  }

  return {
    isDue: false,
    label: stageLabels[fallbackStage],
    colors: stageColors[fallbackStage],
    dateText: `Next review: ${reviewDate.toLocaleDateString()}`,
    showReviewButtons: false,
  };
}

export default function NoteDetailScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const router = useRouter();
  const { user, isPending: authPending } = useAuth();
  const { handleAction, loading: actionLoading, error: actionError } = useReviewAction();

  const [note, setNote] = useState<NoteRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const fetchNote = useCallback(async () => {
    if (!noteId) return;
    setLoading(true);
    setError(null);

    try {
      const headers = await authHeaders();
      const [activeRes, archivedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/notes`, { headers }),
        fetch(`${API_BASE_URL}/api/notes?archived=true`, { headers }),
      ]);

      if (!activeRes.ok || !archivedRes.ok) {
        throw new Error("Failed to fetch notes");
      }

      const activeNotes: NoteRecord[] = await activeRes.json();
      const archivedNotes: NoteRecord[] = await archivedRes.json();
      const found = [...activeNotes, ...archivedNotes].find((n) => n.id === noteId);

      if (!found) {
        setError("Note not found");
        return;
      }

      if (found.archived_at) {
        router.replace("/(app)/notes");
        return;
      }

      setNote(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [noteId, router]);

  useEffect(() => {
    if (!authPending && !user) {
      router.replace("/(auth)/sign-in");
      return;
    }

    if (user) {
      fetchNote();
    }
  }, [authPending, user, fetchNote]);

  const handleButtonClick = async (action: "weak" | "again" | "good") => {
    if (!note) return;
    setActiveButton(action);
    const success = await handleAction(note.id, { action });
    setActiveButton(null);
    if (success) {
      fetchNote();
    }
  };

  const handleReviewIn = async (days: number) => {
    if (!note) return false;
    setActiveButton("review_in");
    const success = await handleAction(note.id, { reviewInDays: days });
    setActiveButton(null);
    if (success) {
      fetchNote();
    }
    return success;
  };

  if (loading || authPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (error || !note) {
    return (
      <View className="flex-1 bg-neutral-950 px-4 pt-12">
        <Pressable
          onPress={() => router.back()}
          className="mb-6 flex-row items-center gap-2"
        >
          <ArrowLeft size={20} color="#737373" />
          <Text className="text-neutral-500">Back to notes</Text>
        </Pressable>
        <View className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <Text className="text-red-400">{error || "Note not found"}</Text>
        </View>
      </View>
    );
  }

  const reviewStatus = getReviewStatus(
    note.next_review,
    note.current_stage as ReviewStage | null
  );

  const isFirstStage =
    (note.current_stage || ReviewStage.TEN_MINUTES) === ReviewStage.TEN_MINUTES;

  return (
    <View className="flex-1 bg-neutral-950">
      <ScrollView className="flex-1 px-4 pt-12">
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          className="mb-6 flex-row items-center gap-2"
        >
          <ArrowLeft size={20} color="#737373" />
          <Text className="text-neutral-500">Back to notes</Text>
        </Pressable>

        {/* Card */}
        <View className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-6">
          {/* Header */}
          <View className="mb-6 flex-row items-start justify-between">
            <Text className="flex-1 text-3xl font-bold text-white">
              {note.name}
            </Text>
            <View
              className="ml-2 rounded-full px-3 py-1"
              style={{ backgroundColor: reviewStatus.colors.bg }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: reviewStatus.colors.text }}
              >
                {reviewStatus.label}
              </Text>
            </View>
          </View>

          {/* Review date */}
          <Text
            className={`mb-4 text-sm ${
              reviewStatus.isDue
                ? "font-semibold text-amber-400"
                : "text-neutral-500"
            }`}
          >
            {reviewStatus.dateText}
          </Text>

          {/* Description */}
          {note.text && (
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-neutral-400">
                Description
              </Text>
              <Text className="text-neutral-300">{note.text}</Text>
            </View>
          )}

          {/* Link */}
          {note.link && (
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-neutral-400">
                Link
              </Text>
              <Pressable onPress={() => Linking.openURL(note.link!)}>
                <Text className="text-amber-400">{note.link}</Text>
              </Pressable>
            </View>
          )}

          {/* Action error */}
          {actionError && (
            <View className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <Text className="text-sm text-red-400">{actionError}</Text>
            </View>
          )}

          {/* Review in control */}
          <View className="mt-8">
            <ReviewInControl
              disabled={actionLoading}
              onSubmit={handleReviewIn}
            />
          </View>

          {/* Review action buttons */}
          {reviewStatus.showReviewButtons && (
            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => handleButtonClick("weak")}
                disabled={actionLoading || isFirstStage}
                className="flex-row items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-2 disabled:opacity-50"
              >
                {actionLoading && activeButton === "weak" && (
                  <ActivityIndicator size="small" color="#f87171" />
                )}
                <Text className="text-red-400">Weak</Text>
              </Pressable>

              <Pressable
                onPress={() => handleButtonClick("again")}
                disabled={actionLoading}
                className="flex-row items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/20 px-4 py-2 disabled:opacity-50"
              >
                {actionLoading && activeButton === "again" && (
                  <ActivityIndicator size="small" color="#fbbf24" />
                )}
                <Text className="text-amber-400">Again</Text>
              </Pressable>

              <Pressable
                onPress={() => handleButtonClick("good")}
                disabled={actionLoading}
                className="flex-row items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 disabled:opacity-50"
              >
                {actionLoading && activeButton === "good" && (
                  <ActivityIndicator size="small" color="#34d399" />
                )}
                <Text className="text-emerald-400">Good</Text>
              </Pressable>
            </View>
          )}

          {/* Not due message */}
          {!reviewStatus.showReviewButtons && (
            <View className="mt-8 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <Text className="text-amber-400/80">
                This note is not due for review yet. Come back later.
              </Text>
            </View>
          )}
        </View>

        {/* Bottom padding for scroll */}
        <View className="h-12" />
      </ScrollView>
    </View>
  );
}
