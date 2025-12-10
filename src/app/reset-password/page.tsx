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

  return (
    <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4 text-white">
      <h1 className="text-2xl font-bold">New password</h1>

      {error && (
        <div className="w-full p-3 bg-red-500/10 border border-red-500 rounded-md text-red-500 text-sm">
          {error}
        </div>
      )}

      {tokenError === "INVALID_TOKEN" ? (
        <div className="w-full space-y-4 text-center">
          <p className="text-neutral-400">The link has expired.</p>
          <Link
            href="/forgot-password"
            className="inline-block bg-white text-black font-medium rounded-md px-4 py-2 hover:bg-gray-200"
          >
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              minLength={8}
              className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2"
            />
            <EyeToggleBtn
              pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-neutral-400 hover:text-neutral-200"
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
              className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2"
            />
            <EyeToggleBtn
              pressed={showConfirmPassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-neutral-400 hover:text-neutral-200"
            />
          </div>

          <p className="text-xs text-neutral-500">Minimum 8 characters</p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium rounded-md px-4 py-2 hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      )}

      <Link
        href="/sign-in"
        className="text-sm text-neutral-400 hover:text-white transition-colors"
      >
        ← Back to sign in
      </Link>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
