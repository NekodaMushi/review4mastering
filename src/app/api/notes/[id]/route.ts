import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { ReviewStage, ActionType } from "@prisma/client";

const actionSchema = z.object({
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

function calculateNextStage(
  currentStage: ReviewStage,
  action: ActionType
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
    const { action } = actionSchema.parse(body);

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
      action as ActionType
    );
    const nextReview = calculateNextReview(newStage);

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        current_stage: newStage,
        next_review: nextReview,
        last_review: new Date(),
        completed_at: newStage === "COMPLETED" ? new Date() : null,
      },
    });

    await prisma.review_history.create({
      data: {
        note_id: id,
        action_type: action as ActionType,
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
    console.error("Error updating note:", error);
    return Response.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const note = await prisma.note.findUnique({
      where: { id },
      select: { user_id: true },
    });

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.user_id !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.note.delete({
      where: { id },
    });

    return Response.json(
      { success: true, message: "Note deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting note:", error);
    return Response.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
