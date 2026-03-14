import React from "react";
import { ActivityIndicator, View, type ActivityIndicatorProps } from "react-native";

import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  size?: ActivityIndicatorProps["size"];
  color?: string;
};

function Spinner({
  className,
  size = "small",
  color = "#f59e0b",
}: SpinnerProps) {
  return (
    <View className={cn("items-center justify-center", className)}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

export { Spinner };
