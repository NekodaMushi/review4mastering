import { stageLabels, stageColors } from "@/lib/constants/noteStages";
import type { ReviewStage } from "@/types";

interface ReviewStatusResult {
  isDue: boolean;
  label: string;
  bgColor: string;
  textColor: string;
  dateText: string;
  showReviewButtons: boolean;
}

export function getReviewStatus(
  nextReviewDate: Date | string,
  currentStage: ReviewStage | null
): ReviewStatusResult {
  const now = new Date();
  const reviewDate = new Date(nextReviewDate);
  const isDue = reviewDate <= now;

  const fallbackStage = currentStage || "TEN_MINUTES";
  const colors = stageColors[fallbackStage as ReviewStage];

  if (isDue) {
    return {
      isDue: true,
      label: "Due now!",
      bgColor: colors.bg,
      textColor: colors.text,
      dateText: `Next review: ${reviewDate.toLocaleDateString()}`,
      showReviewButtons: true,
    };
  }

  return {
    isDue: false,
    label: stageLabels[fallbackStage as ReviewStage],
    bgColor: colors.bg,
    textColor: colors.text,
    dateText: `Next review: ${reviewDate.toLocaleDateString()}`,
    showReviewButtons: false,
  };
}
