import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ntfyServerUrl = process.env.NTFY_BASE_URL || "https://ntfy.nekagentic.fr";
    const ntfySharedUser = "app-notifier";
    const ntfySharedPass = process.env.NTFY_APP_NOTIFIER_PASS;

    if (!ntfySharedPass) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 1. Verif if topic exists
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { ntfyTopic: true },
    });

    // If yes, return credential
    if (existingUser?.ntfyTopic) {
      return NextResponse.json({
        server: ntfyServerUrl.replace(/^https?:\/\//, ""),
        username: ntfySharedUser,
        password: ntfySharedPass,
        topic: existingUser.ntfyTopic,
      });
    }

    // 2. Generate opac topic
    const ntfyTopic = `review_${nanoid(16)}`;

    // 3. Save in DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ntfyTopic: ntfyTopic,
      },
    });

    console.log(`✅ Created topic for user ${session.user.id}: ${ntfyTopic}`);

    return NextResponse.json({
      server: ntfyServerUrl.replace(/^https?:\/\//, ""),
      username: ntfySharedUser,
      password: ntfySharedPass,
      topic: ntfyTopic,
    });
  } catch (error) {
    let message = "Internal server error";
    if (error instanceof Error) {
      message = error.message;
    }
    console.error("Setup error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
