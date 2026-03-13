import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { BackToLogin } from "@/components/ui/BackToLogin";
import { authPost } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils/error-handler";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email?.trim() || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (!email) return;

    setError(null);
    setLoading(true);

    try {
      const result = await authPost("/api/auth/send-verification-email", {
        email,
        callbackURL: "/dashboard",
      });

      if (!result.ok) {
        setError(result.message);
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
    <View className="flex-1 bg-neutral-950 justify-center px-6">
      <View className="w-full max-w-md self-center space-y-6 items-center">
        {/* Header */}
        <View className="items-center space-y-2">
          <Text className="text-3xl font-bold text-white">
            Check your inbox
          </Text>
          <Text className="text-sm text-neutral-400 text-center">
            {email
              ? `We sent a verification link to ${email}.`
              : "Use the verification email we sent to finish securing your account."}
          </Text>
          <Text className="text-xs text-neutral-600 text-center">
            The link expires in 1 hour and will sign you in automatically.
          </Text>
        </View>

        {error && (
          <View className="w-full">
            <ErrorBanner message={error} />
          </View>
        )}

        {resent && (
          <View className="w-full p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <Text className="text-emerald-300 text-sm">
              If an account matches that email address, a fresh verification
              link is on its way.
            </Text>
          </View>
        )}

        {/* Actions */}
        <View className="w-full space-y-3 items-center">
          <Pressable
            onPress={handleResend}
            disabled={!email || loading}
            className="w-full rounded-lg bg-amber-500 px-4 py-3 items-center disabled:opacity-50"
          >
            <Text className="text-neutral-950 font-semibold text-sm tracking-wide">
              {loading ? "Sending..." : "Resend verification email"}
            </Text>
          </Pressable>

          <BackToLogin />
        </View>
      </View>
    </View>
  );
}
