import { ActionType, ReviewStage } from "@prisma/client";
import { z } from "zod";

export const reviewRequestSchema = z
  .object({
    action: z.enum(["weak", "again", "good"]).optional(),
    reviewInDays: z.coerce.number().int().min(1).max(3650).optional(),
  })
  .superRefine((value, ctx) => {
    const fieldsSet = Number(Boolean(value.action)) + Number(value.reviewInDays !== undefined);

    if (fieldsSet !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either an action or reviewInDays",
      });
    }
  });

export type ReviewRequest = z.infer<typeof reviewRequestSchema>;

const STAGES: ReviewStage[] = [
  "TEN_MINUTES",
  "ONE_DAY",
  "SEVEN_DAYS",
  "ONE_MONTH",
  "THREE_MONTHS",
  "ONE_YEAR",
  "TWO_YEARS",
  "FIVE_YEARS",
  "COMPLETED",
];

const STAGE_DURATIONS_MINUTES: Record<ReviewStage, number> = {
  TEN_MINUTES: 10,
  ONE_DAY: 24 * 60,
  SEVEN_DAYS: 7 * 24 * 60,
  ONE_MONTH: 30 * 24 * 60,
  THREE_MONTHS: 90 * 24 * 60,
  ONE_YEAR: 365 * 24 * 60,
  TWO_YEARS: 730 * 24 * 60,
  FIVE_YEARS: 1825 * 24 * 60,
  COMPLETED: 0,
};

export function calculateNextStage(
  currentStage: ReviewStage,
  action: Extract<ActionType, "weak" | "again" | "good">
): ReviewStage {
  const currentIndex = STAGES.indexOf(currentStage);

  if (action === "good") {
    const nextIndex = Math.min(currentIndex + 1, STAGES.length - 1);
    return STAGES[nextIndex];
  }

  if (action === "weak") {
    const prevIndex = Math.max(currentIndex - 1, 0);
    return STAGES[prevIndex];
  }

  return currentStage;
}

export function calculateNextReviewFromStage(stage: ReviewStage): Date {
  if (stage === "COMPLETED") {
    return new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
  }

  const durationMs = STAGE_DURATIONS_MINUTES[stage] * 60 * 1000;
  return new Date(Date.now() + durationMs);
}

export function calculateNextReviewFromDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function resolveReviewUpdate(
  currentStage: ReviewStage | null,
  request: ReviewRequest
) {
  const normalizedStage = currentStage ?? "TEN_MINUTES";

  if (request.reviewInDays !== undefined) {
    return {
      actionType: "review_in" as const,
      newStage: normalizedStage,
      nextReview: calculateNextReviewFromDays(request.reviewInDays),
      preserveCompletedAt: true,
    };
  }

  const action = request.action;

  if (!action) {
    throw new Error("Missing action");
  }

  const newStage = calculateNextStage(normalizedStage, action);

  return {
    actionType: action,
    newStage,
    nextReview: calculateNextReviewFromStage(newStage),
    preserveCompletedAt: false,
  };
}
