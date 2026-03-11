"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { sendVerificationEmail } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/utils/error-handler";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (!email) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await sendVerificationEmail({
        email,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(getErrorMessage(result.error));
      } else {
        setResent(true);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white overflow-hidden flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-bold">
            Check your inbox
          </h1>
          <p className="text-sm text-neutral-400">
            {email
              ? `We sent a verification link to ${email}.`
              : "Use the verification email we sent to finish securing your account."}
          </p>
          <p className="text-xs text-neutral-600">
            The link expires in 1 hour and will sign you in automatically.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-left">
            {error}
          </div>
        )}

        {resent && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm text-left">
            If an account matches that email address, a fresh verification link
            is on its way.
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={!email || loading}
            className="w-full bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 font-semibold rounded-lg px-4 py-3 text-sm tracking-wide hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Resend verification email"}
          </button>

          <Link
            href="/sign-in"
            className="inline-block text-sm text-neutral-500 hover:text-amber-400 transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-500">
          Loading...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
