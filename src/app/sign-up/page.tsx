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

  return (
    <main className="max-w-md mx-auto p-6 space-y-4 text-white">
      <h1 className="text-2xl font-bold">Sign Up</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          required
          className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2"
        />

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            required
            minLength={8}
            className="w-full rounded-md bg-neutral-900 border border-neutral-700 pl-3 pr-10 py-2"
          />
          <EyeToggleBtn
            pressed={showPassword}
            onClick={toggleShowPassword}
            className="absolute inset-y-0 right-2 flex items-center text-neutral-400 hover:text-neutral-200"
          />
        </div>

        <div className="relative">
          <input
            name="verifPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            required
            minLength={8}
            className="w-full rounded-md bg-neutral-900 border border-neutral-700 pl-3 pr-10 py-2"
          />
          <EyeToggleBtn
            pressed={showPassword}
            onClick={toggleShowPassword}
            className="absolute inset-y-0 right-2 flex items-center text-neutral-400 hover:text-neutral-200"
          />
        </div>

        {!passwordMatch && (
          <p className="text-red-500">Password does not match</p>
        )}

        <button
          type="submit"
          className="w-full bg-white text-black font-medium rounded-md px-4 py-2 hover:bg-gray-200"
        >
          Create Account
        </button>
      </form>

      <p className="text-sm text-neutral-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-white hover:underline">
          Login
        </Link>
      </p>
    </main>
  );
}
