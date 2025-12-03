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

// Worker
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
  console.log(`📧 User ntfy topic: ${noteRecord.user.ntfyTopic || "NOT SET"}`);
  console.log(`📤 Attempting to send notification...`);

  await sendNtfyNotification({
    title: "📝 Time to review!",
    body: `Révise "${noteRecord.name}" maintenant`,
    userId: noteRecord.user_id,
    noteId: noteRecord.id,
    priority: 4,
    tags: ["alarm_clock", "book"],
  });

  console.log(`✅ Notification sent for note ${noteId}`);
});

// Event listeners
reviewQueue.on("completed", (job: Job<ReviewJobData>) => {
  console.log(`✅ Job ${job.id} completed`);
});

reviewQueue.on("failed", (job: Job<ReviewJobData>, err: Error) => {
  console.error(`❌ Job ${job.id} failed after ${job.attemptsMade} attempts:`, err.message);
});

reviewQueue.on("stalled", (job: Job<ReviewJobData>) => {
  console.warn(`⚠️ Job ${job.id} stalled`);
});

// Schedule notification
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

export async function rescheduleAllPendingReviews() {
  console.log("🔄 [RESCHEDULE] Starting reschedule process...");
  console.log(`⏰ Current time: ${new Date().toISOString()}`);


  const pendingNotes = await prisma.note.findMany({
    where: {
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

  console.log(`📊 Found ${pendingNotes.length} pending notes`);

  const now = new Date();
  let scheduled = 0;
  let overdue = 0;

  for (const note of pendingNotes) {
    try {
      const isOverdue = note.next_review < now;

      console.log(`\n📝 Note: ${note.name} (${note.id})`);
      console.log(`   User: ${note.user_id}`);
      console.log(`   Next review: ${note.next_review.toISOString()}`);
      console.log(`   Status: ${isOverdue ? "⚠️ OVERDUE" : "✅ Future"}`);

      await scheduleReviewNotification(note.id, note.next_review);
      scheduled++;

      if (isOverdue) {
        overdue++;
      }
    } catch (error) {
      console.error(`Failed to reschedule note ${note.id}:`, error);
    }
  }

  console.log(
    `\n✅ [RESCHEDULE] Completed: ${scheduled}/${pendingNotes.length} reviews`
  );
  console.log(`   📨 ${overdue} overdue notes will be sent immediately`);
  console.log(`   📅 ${scheduled - overdue} scheduled for future`);
}


export async function processOverdueReviews() {
  console.log("🚨 [OVERDUE] Processing overdue reviews...");

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
    },
  });

  console.log(`📊 Found ${overdueNotes.length} overdue notes`);

  for (const note of overdueNotes) {
    try {
      console.log(`📤 Sending overdue notification for: ${note.name}`);
      await reviewQueue.add(
        { noteId: note.id },
        {
          delay: 0,
          jobId: `review-${note.id}`,
        }
      );
    } catch (error) {
      console.error(`Failed to queue overdue note ${note.id}:`, error);
    }
  }

  console.log(`✅ [OVERDUE] - ${overdueNotes.length} notifications queued`);
}
