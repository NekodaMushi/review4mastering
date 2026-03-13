import { Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

type Props = {
  pressed: boolean;
  onPress: () => void;
  className?: string;
};

export function EyeToggleBtn({ pressed, onPress, className }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={pressed ? "Hide password" : "Show password"}
      accessibilityRole="button"
      className={className}
    >
      {pressed ? (
        <EyeOff size={20} color="#737373" />
      ) : (
        <Eye size={20} color="#737373" />
      )}
    </Pressable>
  );
}
