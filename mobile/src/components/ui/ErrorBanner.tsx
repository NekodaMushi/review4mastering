import { View, Text } from "react-native";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
      <Text className="text-red-400 text-sm">{message}</Text>
    </View>
  );
}
