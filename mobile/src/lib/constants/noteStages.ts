import { ReviewStage } from "@/types";

/** Human-readable labels for each review stage. */
export const stageLabels: Record<ReviewStage, string> = {
  TEN_MINUTES: "10 min",
  ONE_DAY: "1 day",
  SEVEN_DAYS: "7 days",
  ONE_MONTH: "1 month",
  THREE_MONTHS: "3 months",
  ONE_YEAR: "1 year",
  TWO_YEARS: "2 years",
  FIVE_YEARS: "5 years",
  COMPLETED: "Completed",
};

/** Background and text colors per stage (React Native hex values). */
export const stageColors: Record<ReviewStage, { bg: string; text: string }> = {
  TEN_MINUTES: { bg: "#fee2e2", text: "#991b1b" },
  ONE_DAY: { bg: "#ffedd5", text: "#9a3412" },
  SEVEN_DAYS: { bg: "#fef9c3", text: "#854d0e" },
  ONE_MONTH: { bg: "#dbeafe", text: "#1e40af" },
  THREE_MONTHS: { bg: "#f3e8ff", text: "#6b21a8" },
  ONE_YEAR: { bg: "#e0e7ff", text: "#3730a3" },
  TWO_YEARS: { bg: "#fce7f3", text: "#9d174d" },
  FIVE_YEARS: { bg: "#dcfce7", text: "#166534" },
  COMPLETED: { bg: "#f3f4f6", text: "#1f2937" },
};
