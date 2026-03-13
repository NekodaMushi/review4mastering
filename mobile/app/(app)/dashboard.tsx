import { useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth";

export default function DashboardScreen() {
  const router = useRouter();
  const { session, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !session?.user) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoading, session, router]);

  if (isLoading || !session?.user) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  const { user } = session;

  return (
    <View className="flex-1 bg-neutral-950 items-center justify-center px-6">
      {/* Header */}
      <View className="w-full max-w-md items-center gap-2">
        <Text className="text-3xl font-bold text-white">Dashboard</Text>
        <Text className="text-neutral-400">
          Welcome,{" "}
          <Text className="text-white font-medium">
            {user.name || "User"}
          </Text>
        </Text>
        <Text className="text-sm text-neutral-500">{user.email}</Text>
      </View>

      {/* Actions */}
      <View className="w-full max-w-md mt-8 gap-3">
        <Pressable
          onPress={() => router.push("/notes")}
          className="w-full bg-amber-500 rounded-lg px-4 py-3 shadow-lg active:opacity-80"
        >
          <Text className="text-neutral-950 font-semibold text-sm tracking-wide text-center">
            My notes
          </Text>
        </Pressable>

        <Pressable
          onPress={() => signOut()}
          className="w-full border border-neutral-800 rounded-lg px-4 py-3 active:bg-neutral-900"
        >
          <Text className="text-neutral-400 font-medium text-sm text-center">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
