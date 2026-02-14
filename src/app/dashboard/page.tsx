"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect } from "react";
import { LifeLine } from "react-loading-indicators";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending || !session?.user)
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-950">
        <LifeLine color="#f59e0b" size="medium" text="" textColor="" />
      </div>
    );

  const { user } = session;

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white overflow-hidden flex items-center justify-center">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-bold">
            Dashboard
          </h1>
          <p className="text-neutral-400">
            Welcome,{" "}
            <span className="text-white font-medium">
              {user.name || "User"}
            </span>
          </p>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/notes")}
            className="w-full bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 font-semibold rounded-lg px-4 py-3 text-sm tracking-wide hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            My notes
          </button>
          <button
            onClick={() => signOut()}
            className="w-full border border-neutral-800 text-neutral-400 font-medium rounded-lg px-4 py-3 text-sm hover:bg-neutral-900 hover:text-white hover:border-neutral-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
