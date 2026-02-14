"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";
import Link from "next/link";
import { EyeToggleBtn } from "@/components/ui/EyeToggleBtn";
import { getErrorMessage } from "@/lib/utils/error-handler";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  useEffect(() => {
    if (tokenError === "INVALID_TOKEN") {
      setError("This link is invalid or has expired. Request a new link.");
    }
  }, [tokenError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Missing token");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        newPassword: password,
        token,
      });

      alert("✓ Password reset successfully!");
      router.push("/sign-in");
    } catch (err) {
      setError(getErrorMessage(err || "Error during password reset"));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg bg-neutral-900/80 border border-neutral-800 pl-4 pr-10 py-3 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors";

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white overflow-hidden flex items-center justify-center">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-bold">
            New password
          </h1>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {tokenError === "INVALID_TOKEN" ? (
          <div className="space-y-4 text-center">
            <p className="text-neutral-400">The link has expired.</p>
            <Link
              href="/forgot-password"
              className="inline-block bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 font-semibold rounded-lg px-6 py-3 text-sm tracking-wide hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={8}
                className={inputClass}
              />
              <EyeToggleBtn
                pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-300"
              />
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                minLength={8}
                className={inputClass}
              />
              <EyeToggleBtn
                pressed={showConfirmPassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-300"
              />
            </div>

            <p className="text-xs text-neutral-600">Minimum 8 characters</p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 font-semibold rounded-lg px-4 py-3 text-sm tracking-wide hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-500">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
