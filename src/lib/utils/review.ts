import { stageLabels, stageBgColor } from "@/lib/constants/noteStages";
import type { ReviewStage } from "@prisma/client";

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

  if (isDue) {
    return {
      isDue: true,
      label: "⏰ Due now!",
      bgColor: stageBgColor[fallbackStage],
      textColor: "",
      dateText: `Next review: ${reviewDate.toLocaleDateString()}`,
      showReviewButtons: true,
    };
  }

  return {
    isDue: false,
    label: stageLabels[fallbackStage],
    bgColor: stageBgColor[fallbackStage],
    textColor: "",
    dateText: `Next review: ${reviewDate.toLocaleDateString()}`,
    showReviewButtons: false,
  };
}
