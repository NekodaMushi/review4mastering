import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { stageLabels, stageColors } from "@/lib/constants/noteStages";
import { useReviewAction } from "@/lib/hooks/useReviewAction";
import { ReviewInControl } from "@/components/ReviewInControl";
import type { NoteRecord } from "@/types/note";
import { ReviewStage } from "@/types";

interface ReviewNoteProps {
  note: NoteRecord | null;
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

  const currentStage =
    (note.current_stage as ReviewStage) || ReviewStage.TEN_MINUTES;
  const isFirstStage = currentStage === ReviewStage.TEN_MINUTES;
  const colors = stageColors[currentStage];
  const stageLabel = stageLabels[currentStage];

  const handleButtonClick = async (action: "weak" | "again" | "good") => {
    const success = await handleAction(note.id, { action });
    if (success) {
      onActionComplete();
      onClose();
    }
  };

  const handleReviewIn = async (days: number) => {
    const success = await handleAction(note.id, { reviewInDays: days });
    if (success) {
      onActionComplete();
      onClose();
    }
    return success;
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center bg-black/60 px-4">
        <View className="max-h-[85%] rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Close Button */}
            <View className="mb-4 flex-row justify-end">
              <Pressable onPress={onClose} className="p-1">
                <X size={24} color="#737373" />
              </Pressable>
            </View>

            {/* Header */}
            <View className="mb-6">
              <Text className="mb-2 text-3xl font-bold text-white">
                {note.name}
              </Text>
              <View
                className="self-start rounded-full px-4 py-1"
                style={{ backgroundColor: colors.bg }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  {stageLabel}
                </Text>
              </View>
            </View>

            {/* Content */}
            <View className="mb-8">
              <Text className="mb-2 text-sm font-semibold text-neutral-500">
                Description
              </Text>
              <Text className="mb-4 text-lg leading-relaxed text-neutral-300">
                {note.text}
              </Text>

              {note.link && (
                <View>
                  <Text className="mb-2 text-sm font-semibold text-neutral-500">
                    Link
                  </Text>
                  <Text className="text-amber-400">{note.link}</Text>
                </View>
              )}
            </View>

            {/* Error */}
            {error && (
              <View className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <Text className="text-sm text-red-400">{error}</Text>
              </View>
            )}

            {/* Actions */}
            <View className="gap-4">
              <ReviewInControl disabled={loading} onSubmit={handleReviewIn} />

              <View className="flex-row justify-end gap-3">
                <Pressable
                  onPress={onClose}
                  className="rounded-lg border border-neutral-700 px-4 py-2"
                >
                  <Text className="text-neutral-400">Close</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleButtonClick("weak")}
                  disabled={loading || isFirstStage}
                  className="rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-2 disabled:opacity-50"
                >
                  <Text className="text-red-400">
                    {loading ? "..." : "Weak"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleButtonClick("again")}
                  disabled={loading}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/20 px-4 py-2 disabled:opacity-50"
                >
                  <Text className="text-amber-400">
                    {loading ? "..." : "Again"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleButtonClick("good")}
                  disabled={loading}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 disabled:opacity-50"
                >
                  <Text className="text-emerald-400">
                    {loading ? "..." : "Good"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
