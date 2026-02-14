"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { EyeToggleBtn } from "@/components/ui/EyeToggleBtn";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  function toggleShowPassword() {
    setShowPassword((s) => !s);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const verifPassword = formData.get("verifPassword") as string;

    if (password !== verifPassword) {
      setPasswordMatch(false);
      return;
    }

    setPasswordMatch(true);

    const res = await signUp.email({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (res.error) {
      setError(res.error.message || "Something went wrong.");
    } else {
      router.push("/dashboard");
    }
  }

  const inputClass =
    "w-full rounded-lg bg-neutral-900/80 border border-neutral-800 px-4 py-3 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors";

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white overflow-hidden flex items-center justify-center">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-bold">
            Sign Up
          </h1>
          <p className="text-sm text-neutral-500">
            Start mastering your knowledge
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            required
            className={inputClass}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className={inputClass}
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              required
              minLength={8}
              className="w-full rounded-lg bg-neutral-900/80 border border-neutral-800 pl-4 pr-10 py-3 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
            />
            <EyeToggleBtn
              pressed={showPassword}
              onClick={toggleShowPassword}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-300"
            />
          </div>

          <div className="relative">
            <input
              name="verifPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              required
              minLength={8}
              className="w-full rounded-lg bg-neutral-900/80 border border-neutral-800 pl-4 pr-10 py-3 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
            />
            <EyeToggleBtn
              pressed={showPassword}
              onClick={toggleShowPassword}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-300"
            />
          </div>

          {!passwordMatch && (
            <p className="text-red-400 text-sm">Passwords do not match</p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 font-semibold rounded-lg px-4 py-3 text-sm tracking-wide hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-amber-400 hover:text-amber-300 transition-colors">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
