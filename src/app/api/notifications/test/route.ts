import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendNtfyNotification } from "@/lib/ntfy";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const note = await prisma.note.findFirst({
      where: { user_id: session.user.id,},
      orderBy: { id: 'desc',},
});

    if (!note) {
      return NextResponse.json({ error: "No notes found" }, { status: 404 });
    }


    await sendNtfyNotification({
      userId: session.user.id,
      title: "📝 Time to Review!",
      body: `Review: "${note.name}"`,
      noteId: note.id, 
      priority: 4,
      tags: ["review"],
    });

    return NextResponse.json({
      success: true,
      message: `✅ Notification sent for note: ${note.name}`,
      noteTested: note.id,
    });
  } catch (error) {
    let message = "Internal server error";
    if (error instanceof Error) {
      message = error.message;
    }
    console.error("Test notification error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
