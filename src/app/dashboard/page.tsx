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

  if (isPending)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LifeLine color="#3b82f6" size="medium" text="" textColor="" />
      </div>
    );

  if (!session?.user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LifeLine color="#3b82f6" size="medium" text="" textColor="" />
      </div>
    );

  const { user } = session;

  return (
    <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4 text-white">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {user.name || "User"}!</p>
      <p>Email: {user.email}</p>
      <button
        onClick={() => router.push("/notes")}
        className="w-full bg-blue-600 text-white font-medium rounded-mx px-4 py-2 hover:bg-blue-700"
      >
        My notes
      </button>
      <button
        onClick={() => signOut()}
        className="w-full bg-white text-black font-medium rounded-md px-4 py-2 hover:bg-gray-200"
      >
        Sign Out
      </button>
    </main>
  );
}
