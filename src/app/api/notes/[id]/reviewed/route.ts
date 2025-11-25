
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { ReviewStage } from "@prisma/client";
import { scheduleReviewNotification } from "@/lib/reviewQueue";

const reviewSchema = z.object({
  action: z.enum(["weak", "again", "good"]),
});

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

const STAGE_DURATIONS: Record<ReviewStage, number> = {
  TEN_MINUTES: 0.2, // To be removed after testing
  ONE_DAY: 24 * 60,
  SEVEN_DAYS: 7 * 24 * 60,
  ONE_MONTH: 30 * 24 * 60,
  THREE_MONTHS: 90 * 24 * 60,
  ONE_YEAR: 365 * 24 * 60,
  TWO_YEARS: 730 * 24 * 60,
  FIVE_YEARS: 1825 * 24 * 60,
  COMPLETED: 0,
};

function calculateNextStage(
  currentStage: ReviewStage,
  action: string
): ReviewStage {
  const currentIndex = STAGES.indexOf(currentStage);

  if (action === "good") {
    const nextIndex = Math.min(currentIndex + 1, STAGES.length - 1);
    return STAGES[nextIndex];
  }

  if (action === "again") {
    return currentStage;
  }

  if (action === "weak") {
    const prevIndex = Math.max(currentIndex - 1, 0);
    return STAGES[prevIndex];
  }

  return currentStage;
}

function calculateNextReview(stage: ReviewStage): Date {
  if (stage === "COMPLETED") {
    return new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
  }

  const durationMs = STAGE_DURATIONS[stage] * 60 * 1000;
  return new Date(Date.now() + durationMs);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = reviewSchema.parse(body);

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.user_id !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const oldStage = note.current_stage;
    const newStage = calculateNextStage(
      oldStage || "TEN_MINUTES",
      action
    );
    const nextReviewDate = calculateNextReview(newStage);


    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        current_stage: newStage,
        next_review: nextReviewDate,
        last_review: new Date(),
        completed_at: newStage === "COMPLETED" ? new Date() : null,
      },
    });

    // SCHEDULE Bull (Redis)
    if (newStage !== "COMPLETED") {
      await scheduleReviewNotification(id, nextReviewDate);
    }

    // Historique 
    await prisma.review_history.create({
      data: {
        note_id: id,
        action_type: action,
        old_stage: oldStage,
        new_stage: newStage,
      },
    });

    return Response.json(updatedNote, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const first = error.issues?.[0]?.message ?? "Validation error";
      return Response.json({ error: first }, { status: 400 });
    }
    console.error("Error marking note as reviewed:", error);
    return Response.json(
      { error: "Failed to mark note as reviewed" },
      { status: 500 }
    );
  }
}
