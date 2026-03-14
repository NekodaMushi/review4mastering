import { Text, Pressable } from "react-native";
import { Link } from "expo-router";

export function BackToLogin() {
  return (
    <Link href="/(auth)/sign-in" asChild>
      <Pressable>
        <Text className="text-sm text-neutral-500">{"\u2190"} Back to login</Text>
      </Pressable>
    </Link>
  );
}
