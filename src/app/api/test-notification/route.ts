// src/app/api/test-notification/route.ts
import { NextResponse } from "next/server";
import { sendNtfyNotification } from "@/lib/ntfy";

export async function POST(request: Request) {
  const { userId } = await request.json();

  await sendNtfyNotification({
    title: "🧪 Test manuel",
    body: "Ceci est un test depuis l'API",
    userId: userId,
    priority: 4,
    tags: ["alarm_clock"],
  });

  return NextResponse.json({ success: true });
}
