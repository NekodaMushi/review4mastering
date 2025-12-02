import { NextResponse } from "next/server";
import { reviewQueue } from "@/lib/reviewQueue";

export async function GET() {
  try {
    const waiting = await reviewQueue.getWaiting();
    const active = await reviewQueue.getActive();
    const delayed = await reviewQueue.getDelayed();
    const completed = await reviewQueue.getCompleted();
    const failed = await reviewQueue.getFailed();

    const jobs = await Promise.all(
      delayed.map(async (job) => ({
        id: job.id,
        noteId: job.data.noteId,
        delay: job.opts.delay,
        processAt: new Date(job.processedOn || job.timestamp + (job.opts.delay || 0)),
      }))
    );

    return NextResponse.json({
      counts: {
        waiting: waiting.length,
        active: active.length,
        delayed: delayed.length,
        completed: completed.length,
        failed: failed.length,
      },
      delayedJobs: jobs,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
