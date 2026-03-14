import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View className="flex-1 items-center justify-center bg-neutral-950 px-6">
        <Text className="mb-4 text-2xl font-bold text-white">
          Page Not Found
        </Text>
        <Text className="mb-8 text-center text-neutral-400">
          The screen you're looking for doesn't exist.
        </Text>
        <Link href="/">
          <Text className="text-amber-400 font-semibold">Go Home</Text>
        </Link>
      </View>
    </>
  );
}
