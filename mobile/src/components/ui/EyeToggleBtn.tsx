import React from "react";
import { Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { cn } from "@/lib/utils";

type EyeToggleBtnProps = {
  pressed: boolean;
  onPress: () => void;
  className?: string;
  color?: string;
};

function EyeToggleBtn({
  pressed,
  onPress,
  className,
  color = "#a3a3a3",
}: EyeToggleBtnProps) {
  const Icon = pressed ? EyeOff : Eye;

  return (
    <Pressable
      onPress={onPress}
      className={cn("items-center justify-center p-2", className)}
      accessibilityRole="button"
      accessibilityLabel={pressed ? "Hide password" : "Show password"}
    >
      <Icon size={20} color={color} />
    </Pressable>
  );
}

export { EyeToggleBtn };
