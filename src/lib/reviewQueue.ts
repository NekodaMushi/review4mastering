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


  if (noteRecord.next_review > new Date()) {
    console.log(`⏭️ Note ${noteId} not due yet, skipping`);
    return;
  }


  await sendNtfyNotification({
    title: "📝 Time to review!",
    body: `Révise "${noteRecord.name}" maintenant`,
    userId: noteRecord.user_id,
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

  const delayMin = Math.round(delay / 1000 / 60);
  console.log(`⏰ Scheduled review for ${noteId} in ${delayMin} min`);
}

// Cancel notification 
export async function cancelReviewNotification(noteId: string) {
  const job = await reviewQueue.getJob(`review-${noteId}`);

  if (job) {
    await job.remove();
    console.log(`🗑️ Cancelled review notification for note ${noteId}`);
    return true;
  }

  return false;
}

// Reschedule on start
export async function rescheduleAllPendingReviews() {
  console.log("🔄 Rescheduling pending reviews...");

  const pendingNotes = await prisma.note.findMany({
    where: {
      next_review: {
        gte: new Date(), // Notes futures
      },
      completed_at: null, // Not yet completed
    },
    select: {
      id: true,
      next_review: true,
    },
  });

  let scheduled = 0;

  for (const note of pendingNotes) {
    try {
      await scheduleReviewNotification(note.id, note.next_review);
      scheduled++;
    } catch (error) {
      console.error(`Failed to reschedule note ${note.id}:`, error);
    }
  }

  console.log(`✅ Rescheduled ${scheduled}/${pendingNotes.length} reviews`);
}
