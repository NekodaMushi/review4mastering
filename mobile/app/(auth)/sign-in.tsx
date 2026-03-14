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
import { useRouter, Link } from "expo-router";
import { EyeToggleBtn } from "@/components/ui/EyeToggleBtn";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { authPost } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils/error-handler";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const result = await authPost("/api/auth/sign-in/email", {
        email: trimmedEmail,
        password,
      });

      if (!result.ok) {
        if (result.message === "Email not verified") {
          router.replace(
            `/(auth)/verify-email?email=${encodeURIComponent(trimmedEmail)}`
          );
          return;
        }
        setError(result.message);
      } else {
        router.replace("/(app)/dashboard");
      }
    } catch (err) {
      setError(getErrorMessage(err));
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
            <Text className="text-3xl font-bold text-white">Login</Text>
            <Text className="text-sm text-neutral-500">Welcome back</Text>
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

            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
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

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className="w-full rounded-lg bg-amber-500 px-4 py-3 items-center disabled:opacity-50"
            >
              <Text className="text-neutral-950 font-semibold text-sm tracking-wide">
                {loading ? "Logging in..." : "Login"}
              </Text>
            </Pressable>
          </View>

          {/* Links */}
          <View className="items-center space-y-3">
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text className="text-sm text-neutral-500">
                  Password forgotten?
                </Text>
              </Pressable>
            </Link>

            <Text className="text-sm text-neutral-500">
              No account yet?{" "}
              <Link href="/(auth)/sign-up">
                <Text className="text-amber-400">Sign Up</Text>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
