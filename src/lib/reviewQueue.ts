import Queue, { Job } from "bull";
import { prisma } from "@/lib/prisma";
import { sendNtfyNotification } from "@/lib/ntfy";

interface ReviewJobData {
  noteId: string;
}

export const reviewQueue = new Queue<ReviewJobData>("reviews", {
  redis: process.env.REDIS_URL || "redis://localhost:6379",
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

function getOverdueMessage(
  minutesLate: number,
  noteName: string
): {
  title: string;
  body: string;
  priority: 1 | 2 | 3 | 4 | 5;
} {
  if (minutesLate < 60) {
    return {
      title: "⏰ Révision en retard",
      body: `Hey, ça fait plus de ${Math.round(
        minutesLate
      )} minutes que tu devais réviser "${noteName}" !`,
      priority: 4,
    };
  } else if (minutesLate < 1440) {
    const hours = Math.round(minutesLate / 60);
    return {
      title: "⚠️ Révision en retard",
      body: `Hello buddy, ça fait ${hours}h que tu devais réviser "${noteName}" !`,
      priority: 4,
    };
  } else if (minutesLate < 10080) {
    const days = Math.round(minutesLate / 1440);
    return {
      title: "🔴 Révision très en retard",
      body: `Oublie pas que tu dois réviser "${noteName}" depuis ${days} jour${
        days > 1 ? "s" : ""
      } !`,
      priority: 5,
    };
  } else if (minutesLate < 43200) {
    const weeks = Math.round(minutesLate / 10080);
    return {
      title: "🚨 Révision critique",
      body: `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""} déjà que tu devais réviser "${noteName}"...`,
      priority: 5,
    };
  } else {
    const months = Math.round(minutesLate / 43200);
    return {
      title: "💀 Révision oubliée",
      body: `Il y a ${months} mois déjà que tu devais réviser "${noteName}"... C'est le moment !`,
      priority: 5,
    };
  }
}

// 🔄 WORKER
reviewQueue.process(async (job: Job<ReviewJobData>) => {
  const { noteId } = job.data;

  console.log(`📝 Processing review notification for note: ${noteId}`);
  console.log(`⏰ Current time: ${new Date().toISOString()}`);

  const noteRecord = await prisma.note.findUnique({
    where: { id: noteId },
    include: { user: true },
  });

  if (!noteRecord) {
    console.warn(`⚠️ Note ${noteId} not found (maybe deleted)`);
    return;
  }

  if (!noteRecord.user) {
    console.error(`❌ Note ${noteId} has no user`);
    return;
  }

  console.log(`📅 Note next_review: ${noteRecord.next_review.toISOString()}`);
  console.log(`👤 User ID: ${noteRecord.user_id}`);

  const now = new Date();
  const minutesLate = Math.max(
    0,
    (now.getTime() - noteRecord.next_review.getTime()) / 1000 / 60
  );

  let title = "📝 Time to review!";
  let body = `Révise "${noteRecord.name}" maintenant`;
  let priority: 1 | 2 | 3 | 4 | 5 = 4;

  if (minutesLate > 10) {
    const overdueMsg = getOverdueMessage(minutesLate, noteRecord.name);
    title = overdueMsg.title;
    body = overdueMsg.body;
    priority = overdueMsg.priority;
    console.log(`⚠️ Note is ${Math.round(minutesLate)} minutes late`);
  }

  console.log(`📤 Attempting to send notification...`);

  await sendNtfyNotification({
    title,
    body,
    userId: noteRecord.user_id,
    noteId: noteRecord.id,
    priority,
    tags:
      minutesLate > 10 ? ["warning", "alarm_clock"] : ["alarm_clock", "book"],
  });

  console.log(`✅ Notification sent for note ${noteId}`);
});

// ⚙️ EVENT LISTENERS
reviewQueue.on("completed", (job: Job<ReviewJobData>) => {
  console.log(`✅ Job ${job.id} completed`);
});

reviewQueue.on("failed", (job: Job<ReviewJobData>, err: Error) => {
  console.error(
    `❌ Job ${job.id} failed after ${job.attemptsMade} attempts:`,
    err.message
  );
});

reviewQueue.on("stalled", (job: Job<ReviewJobData>) => {
  console.warn(`⚠️ Job ${job.id} stalled`);
});

// ⚙️ SCHEDULE NOTIFICATIONS
export async function scheduleReviewNotification(
  noteId: string,
  nextReviewDate: Date
) {
  const delay = Math.max(0, nextReviewDate.getTime() - Date.now());
  const delayMin = Math.round(delay / 1000 / 60);

  console.log(`⏰ [SCHEDULE] Note: ${noteId}`);
  console.log(`   Next review: ${nextReviewDate.toISOString()}`);
  console.log(`   Delay: ${delayMin} minutes`);

  const existingJob = await reviewQueue.getJob(`review-${noteId}`);
  if (existingJob) {
    await existingJob.remove();
    console.log(`🔄 Removed old job for note ${noteId}`);
  }

  await reviewQueue.add(
    { noteId },
    {
      delay,
      jobId: `review-${noteId}`,
    }
  );

  console.log(`✅ [SCHEDULE] Job created: review-${noteId}`);
}

export async function cancelReviewNotification(noteId: string) {
  const job = await reviewQueue.getJob(`review-${noteId}`);

  if (job) {
    await job.remove();
    console.log(`🗑️ Cancelled review notification for note ${noteId}`);
    return true;
  }

  return false;
}

export async function processOverdueReviews() {
  console.log("🚨 [OVERDUE] Starting overdue reviews processing...");
  console.log(`⏰ Current time: ${new Date().toISOString()}`);

  const overdueNotes = await prisma.note.findMany({
    where: {
      next_review: {
        lt: new Date(),
      },
      completed_at: null,
    },
    select: {
      id: true,
      next_review: true,
      name: true,
      user_id: true,
    },
    orderBy: {
      next_review: "asc",
    },
  });

  console.log(`📊 Found ${overdueNotes.length} overdue notes`);

  let processed = 0;

  for (const note of overdueNotes) {
    try {
      const minutesLate =
        (Date.now() - note.next_review.getTime()) / 1000 / 60;
      console.log(`\n📝 Note: ${note.name} (${note.id})`);
      console.log(`   User: ${note.user_id}`);
      console.log(`   Was due: ${note.next_review.toISOString()}`);
      console.log(`   Late by: ${Math.round(minutesLate)} minutes`);

      await scheduleReviewNotification(note.id, new Date());
      processed++;
    } catch (error) {
      console.error(`Failed to process overdue note ${note.id}:`, error);
    }
  }

  console.log(
    `\n✅ [OVERDUE] Processed: ${processed}/${overdueNotes.length} overdue reviews`
  );
  return { total: overdueNotes.length, processed };
}

export async function rescheduleAllReviews() {
  console.log("🔄 [RESCHEDULE] Starting full reschedule process...");
  console.log(`⏰ Current time: ${new Date().toISOString()}`);

  const overdueResult = await processOverdueReviews();

  const pendingNotes = await prisma.note.findMany({
    where: {
      next_review: {
        gte: new Date(),
      },
      completed_at: null,
    },
    select: {
      id: true,
      next_review: true,
      name: true,
      user_id: true,
    },
  });

  console.log(`\n📊 Found ${pendingNotes.length} pending notes (future)`);

  let scheduled = 0;

  for (const note of pendingNotes) {
    try {
      console.log(`\n📝 Note: ${note.name} (${note.id})`);
      console.log(`   User: ${note.user_id}`);
      console.log(`   Next review: ${note.next_review.toISOString()}`);

      await scheduleReviewNotification(note.id, note.next_review);
      scheduled++;
    } catch (error) {
      console.error(`Failed to reschedule note ${note.id}:`, error);
    }
  }

  console.log(`\n✅ [RESCHEDULE] Completed:`);
  console.log(`   - Overdue: ${overdueResult.processed}/${overdueResult.total}`);
  console.log(`   - Pending: ${scheduled}/${pendingNotes.length}`);

  return {
    overdue: overdueResult,
    pending: { total: pendingNotes.length, scheduled },
  };
}
