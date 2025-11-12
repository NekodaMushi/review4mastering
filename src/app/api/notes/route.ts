import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const createNoteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  text: z.string().min(1, "Description is required"),
  link: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, text, link } = createNoteSchema.parse(body);

    const nextRevision = new Date(Date.now() + 10 * 60 * 1000);

    const note = await prisma.note.create({
      data: {
        user_id: session.user.id,
        name,
        text,
        link: link || null,
        current_stage: "TEN_MINUTES",
        next_revision: nextRevision,
      },
    });

    return Response.json(note, { status: 201 });
} catch (error) {
  if (error instanceof z.ZodError) {
    const first = error.issues?.[0]?.message ?? "Validation error";
    return Response.json({ error: first }, { status: 400 });
  }
  return Response.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await prisma.note.findMany({
      where: {
        user_id: session.user.id,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return Response.json(notes, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
