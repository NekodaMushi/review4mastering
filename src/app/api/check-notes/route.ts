import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  
  const pendingNotes = await prisma.note.findMany({
    where: {
      next_review: {
        gte: now,
      },
      completed_at: null,
    },
    select: {
      id: true,
      name: true,
      next_review: true,
      user_id: true,
      completed_at: true,
    },
  });

  const allNotes = await prisma.note.findMany({
    select: {
      id: true,
      name: true,
      next_review: true,
      completed_at: true,
    },
  });

  return NextResponse.json({
    currentTime: now.toISOString(),
    pendingCount: pendingNotes.length,
    pendingNotes: pendingNotes,
    allNotesCount: allNotes.length,
    allNotes: allNotes,
  });
}
