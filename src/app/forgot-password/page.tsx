"use client";

import { useState } from "react";
import { forgetPassword } from "@/lib/auth-client";
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
      await forgetPassword({
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
      <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4 text-white">
        <div className="w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold">Email sent ✓</h1>
          <p className="text-neutral-400">
            An email with a reset link has been sent to{" "}
            <span className="text-white font-medium">{email}</span>
          </p>
          <p className="text-sm text-neutral-500">
            The link expires in 10 minutes.
          </p>
          <Link
            href="/sign-in"
            className="inline-block mt-4 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4 text-white">
      <h1 className="text-2xl font-bold">Forgot password</h1>
      <p className="text-sm text-neutral-400 text-center">
        Enter your email to receive a reset link
      </p>

      {error && (
        <div className="w-full p-3 bg-red-500/10 border border-red-500 rounded-md text-red-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-medium rounded-md px-4 py-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send link"}
        </button>
      </form>

      <Link
        href="/sign-in"
        className="text-sm text-neutral-400 hover:text-white transition-colors"
      >
        ← Back to sign in
      </Link>
    </main>
  );
}
