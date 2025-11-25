interface NtfyParams {
  title: string;
  body: string;
  userId: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  tags?: string[]; 
}

export async function sendNtfyNotification({
  title,
  body,
  userId,
  priority = 3,
  tags = ["clipboard"],
}: NtfyParams) {
  const ntfyServer = process.env.NTFY_BASE_URL || "https://ntfy.sh";
  const topic = `review_${userId}`;

  try {
    console.log(`📡 Sending ntfy to ${ntfyServer}/${topic}`);

    const response = await fetch(`${ntfyServer}/${topic}`, {
      method: "POST",
      body: body,
      headers: {
        Title: title,
        Priority: priority.toString(),
        Tags: tags.join(","),
        ...(process.env.NTFY_SERVER_TOKEN && {
          Authorization: `Bearer ${process.env.NTFY_SERVER_TOKEN}`,
        }),
      },
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
