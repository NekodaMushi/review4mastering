import { ReviewStage } from "@prisma/client";

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

export const stageBgColor: Record<ReviewStage, string> = {
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
