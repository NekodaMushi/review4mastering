"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";
import Link from "next/link";
import { getErrorMessage } from "@/lib/utils/error-handler";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="relative min-h-screen bg-neutral-950 text-white overflow-hidden flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
        </div>
        <div className="relative z-10 w-full max-w-md mx-auto px-6 space-y-4 text-center">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-bold">
            Email sent
          </h1>
          <p className="text-neutral-400">
            A reset link has been sent to{" "}
            <span className="text-amber-400 font-medium">{email}</span>
          </p>
          <p className="text-sm text-neutral-600">
            The link expires in 10 minutes.
          </p>
          <Link
            href="/sign-in"
            className="inline-block mt-4 text-sm text-neutral-500 hover:text-amber-400 transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </main>
    );
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
            Forgot password
          </h1>
          <p className="text-sm text-neutral-500">
            Enter your email to receive a reset link
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-lg bg-neutral-900/80 border border-neutral-800 px-4 py-3 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 font-semibold rounded-lg px-4 py-3 text-sm tracking-wide hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send link"}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/sign-in"
            className="text-sm text-neutral-500 hover:text-amber-400 transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
