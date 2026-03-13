import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { EyeToggleBtn } from "@/components/ui/EyeToggleBtn";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { BackToLogin } from "@/components/ui/BackToLogin";
import { authPost } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils/error-handler";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string; error?: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = params.token;
  const tokenError = params.error;
  const isInvalidToken = tokenError === "INVALID_TOKEN" || !token;

  useEffect(() => {
    if (tokenError === "INVALID_TOKEN") {
      setError("This link is invalid or has expired. Request a new link.");
    }
  }, [tokenError]);

  async function handleSubmit() {
    setError("");

    if (isInvalidToken || !token) {
      setError("This link is invalid or has expired. Request a new link.");
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
      const result = await authPost("/api/auth/reset-password", {
        newPassword: password,
        token,
      });

      if (!result.ok) {
        setError(result.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(getErrorMessage(err || "Error during password reset"));
    } finally {
      setLoading(false);
    }
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
              {success ? "Password updated" : "New password"}
            </Text>
            {success && (
              <Text className="text-sm text-neutral-500">
                Your password has been reset. You can sign in with it now.
              </Text>
            )}
          </View>

          {error !== "" && <ErrorBanner message={error} />}

          {success ? (
            <View className="items-center space-y-4">
              <Link href="/(auth)/sign-in" asChild>
                <Pressable className="rounded-lg bg-amber-500 px-6 py-3">
                  <Text className="text-neutral-950 font-semibold text-sm tracking-wide">
                    Go to login
                  </Text>
                </Pressable>
              </Link>
            </View>
          ) : isInvalidToken ? (
            <View className="items-center space-y-4">
              <Text className="text-neutral-400">The link has expired.</Text>
              <Link href="/(auth)/forgot-password" asChild>
                <Pressable className="rounded-lg bg-amber-500 px-6 py-3">
                  <Text className="text-neutral-950 font-semibold text-sm tracking-wide">
                    Request a new link
                  </Text>
                </Pressable>
              </Link>
            </View>
          ) : (
            <View className="space-y-4">
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="New password"
                  placeholderTextColor="#525252"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="w-full rounded-lg bg-neutral-900 border border-neutral-800 pl-4 pr-10 py-3 text-sm text-white"
                />
                <EyeToggleBtn
                  pressed={showPassword}
                  onPress={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-0 bottom-0 justify-center"
                />
              </View>

              <View className="relative">
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor="#525252"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  className="w-full rounded-lg bg-neutral-900 border border-neutral-800 pl-4 pr-10 py-3 text-sm text-white"
                />
                <EyeToggleBtn
                  pressed={showConfirmPassword}
                  onPress={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3 top-0 bottom-0 justify-center"
                />
              </View>

              <Text className="text-xs text-neutral-600">
                Minimum 8 characters
              </Text>

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className="w-full rounded-lg bg-amber-500 px-4 py-3 items-center disabled:opacity-50"
              >
                <Text className="text-neutral-950 font-semibold text-sm tracking-wide">
                  {loading ? "Resetting..." : "Reset password"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Link */}
          <View className="items-center">
            <BackToLogin />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
