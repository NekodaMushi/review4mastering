"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { EyeToggleBtn } from "@/components/ui/EyeToggleBtn";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function toggleShowPassword() {
    setShowPassword((s) => !s);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const res = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (res.error) {
      setError(res.error.message || "Something went wrong.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white overflow-hidden flex items-center justify-center">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-bold">
            Login
          </h1>
          <p className="text-sm text-neutral-500">
            Welcome back
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-lg bg-neutral-900/80 border border-neutral-800 px-4 py-3 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full rounded-lg bg-neutral-900/80 border border-neutral-800 pl-4 pr-10 py-3 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
            />
            <EyeToggleBtn
              pressed={showPassword}
              onClick={toggleShowPassword}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 font-semibold rounded-lg px-4 py-3 text-sm tracking-wide hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            Login
          </button>
        </form>

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/forgot-password"
            className="text-sm text-neutral-500 hover:text-amber-400 transition-colors"
          >
            Password forgotten?
          </Link>
          <p className="text-sm text-neutral-500">
            No account yet?{" "}
            <Link href="/sign-up" className="text-amber-400 hover:text-amber-300 transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
