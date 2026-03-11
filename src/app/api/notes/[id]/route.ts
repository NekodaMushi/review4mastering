import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import {
  reviewRequestSchema,
  resolveReviewUpdate,
} from "@/lib/reviewScheduling";
import {
  cancelReviewNotification,
  scheduleReviewNotification,
} from "@/lib/reviewQueue";

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
    const reviewRequest = reviewRequestSchema.parse(body);

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
    const reviewUpdate = resolveReviewUpdate(oldStage, reviewRequest);

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        current_stage: reviewUpdate.newStage,
        next_review: reviewUpdate.nextReview,
        last_review: new Date(),
        completed_at: reviewUpdate.preserveCompletedAt
          ? note.completed_at
          : reviewUpdate.newStage === "COMPLETED"
            ? new Date()
            : null,
      },
    });

    if (reviewUpdate.actionType === "review_in") {
      await scheduleReviewNotification(id, reviewUpdate.nextReview);
    } else if (reviewUpdate.newStage === "COMPLETED") {
      await cancelReviewNotification(id);
    } else {
      await scheduleReviewNotification(id, reviewUpdate.nextReview);
    }

    await prisma.review_history.create({
      data: {
        note_id: id,
        action_type: reviewUpdate.actionType,
        old_stage: oldStage,
        new_stage: reviewUpdate.newStage,
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
