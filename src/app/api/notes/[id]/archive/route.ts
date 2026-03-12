import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import {
  cancelReviewNotification,
  scheduleReviewNotification,
} from "@/lib/reviewQueue";

const archiveRequestSchema = z.object({
  archived: z.boolean(),
});

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
    const { archived } = archiveRequestSchema.parse(body);

    const note = await prisma.note.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        archived_at: true,
        completed_at: true,
        next_review: true,
      },
    });

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.user_id !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        archived_at: archived ? new Date() : null,
      },
    });

    if (archived) {
      await cancelReviewNotification(id);
    } else if (!note.completed_at) {
      await scheduleReviewNotification(id, note.next_review);
    }

    return Response.json(updatedNote, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const first = error.issues?.[0]?.message ?? "Validation error";
      return Response.json({ error: first }, { status: 400 });
    }

    console.error("Error archiving note:", error);
    return Response.json(
      { error: "Failed to update archive state" },
      { status: 500 }
    );
  }
}
