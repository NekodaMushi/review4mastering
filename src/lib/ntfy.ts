import { prisma } from "@/lib/prisma";

interface NtfyParams {
  title: string;
  body: string;
  userId: string;
  noteId?: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}

interface NtfyPayload {
  topic: string;
  title: string;
  message: string;
  priority: number;
  tags: string[];
  click?: string;
}

export async function sendNtfyNotification({
  title,
  body,
  userId,
  noteId,
  priority = 3,
  tags = [],
}: NtfyParams) {
  const ntfyServer = process.env.NTFY_BASE_URL || "https://ntfy.nekagentic.fr";
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://192.168.0.103:3000";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ntfyTopic: true },
  });

  if (!user?.ntfyTopic) {
    console.warn(`⚠️ No ntfy topic configured for user ${userId}`);
    return;
  }

  try {
    console.log(`📡 Sending ntfy to ${ntfyServer}`);

    const payload: NtfyPayload = {
      topic: user.ntfyTopic,
      title: title,
      message: body,
      priority: priority,
      tags: tags,
    };

    // link on notification click
    if (noteId) {
      payload.click = `${appBaseUrl}/notes/${noteId}`;
    }

    const response = await fetch(ntfyServer, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ntfy error:", response.status, errorText);
      throw new Error(`Ntfy returned ${response.status}`);
    }

    console.log(`✅ Notification sent to user ${userId}`);
  } catch (error) {
    console.error("❌ Failed to send ntfy:", error);
    throw error;
  }
}
