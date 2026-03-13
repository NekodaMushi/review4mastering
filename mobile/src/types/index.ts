/**
 * Shared type definitions for the Review4Mastering mobile app.
 *
 * Enums mirror the Prisma schema so the mobile client can work
 * without a direct Prisma dependency.
 */

/** Spaced-repetition review stages (mirrors Prisma `ReviewStage`). */
export enum ReviewStage {
  TEN_MINUTES = "TEN_MINUTES",
  ONE_DAY = "ONE_DAY",
  SEVEN_DAYS = "SEVEN_DAYS",
  ONE_MONTH = "ONE_MONTH",
  THREE_MONTHS = "THREE_MONTHS",
  ONE_YEAR = "ONE_YEAR",
  TWO_YEARS = "TWO_YEARS",
  FIVE_YEARS = "FIVE_YEARS",
  COMPLETED = "COMPLETED",
}

/** Review action types (mirrors Prisma `ActionType`). */
export enum ActionType {
  weak = "weak",
  again = "again",
  good = "good",
  review_in = "review_in",
}

export * from "./note";
