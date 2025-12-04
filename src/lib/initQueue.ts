import { rescheduleAllReviews } from "@/lib/reviewQueue";

export async function initializeQueue() {
  const skipReschedule = process.env.SKIP_RESCHEDULE === "true";
  
  console.log("🚀 Initializing review queue...");
  
  try {
    if (!skipReschedule) {
      console.log("📋 Rescheduling pending reviews...");
      await rescheduleAllReviews();
    }
    console.log("✅ Review queue initialized");
  } catch (error) {
    console.error("❌ Failed to initialize queue:", error);
  }
}
