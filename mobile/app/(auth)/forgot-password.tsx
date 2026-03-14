import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { BackToLogin } from "@/components/ui/BackToLogin";
import { authPost } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils/error-handler";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const result = await authPost("/api/auth/request-password-reset", {
        email: trimmedEmail,
        redirectTo: "/reset-password",
      });

      if (!result.ok) {
        setError(result.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View className="flex-1 bg-neutral-950 justify-center px-6">
        <View className="w-full max-w-md self-center space-y-4 items-center">
          <Text className="text-3xl font-bold text-white">Email sent</Text>
          <Text className="text-neutral-400 text-center">
            If an account exists for that email address, a reset link is on its
            way.
          </Text>
          <Text className="text-sm text-neutral-600">
            The link expires in 10 minutes.
          </Text>
          <View className="mt-4">
            <BackToLogin />
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-neutral-950"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-md self-center space-y-6">
          {/* Header */}
          <View className="items-center space-y-2">
            <Text className="text-3xl font-bold text-white">
              Forgot password
            </Text>
            <Text className="text-sm text-neutral-500">
              Enter your email to receive a reset link
            </Text>
          </View>

          {error && <ErrorBanner message={error} />}

          {/* Form */}
          <View className="space-y-4">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#525252"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white"
            />

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className="w-full rounded-lg bg-amber-500 px-4 py-3 items-center disabled:opacity-50"
            >
              <Text className="text-neutral-950 font-semibold text-sm tracking-wide">
                {loading ? "Sending..." : "Send link"}
              </Text>
            </Pressable>
          </View>

          {/* Link */}
          <View className="items-center">
            <BackToLogin />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
