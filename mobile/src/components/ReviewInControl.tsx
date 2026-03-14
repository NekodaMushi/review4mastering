import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";

interface ReviewInControlProps {
  disabled?: boolean;
  onSubmit: (days: number) => Promise<boolean>;
}

export function ReviewInControl({
  disabled = false,
  onSubmit,
}: ReviewInControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [days, setDays] = useState("14");
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const parsedDays = Number(days);

    if (!Number.isInteger(parsedDays) || parsedDays < 1) {
      setInputError("Enter a whole number of days greater than 0.");
      return;
    }

    setInputError(null);
    const success = await onSubmit(parsedDays);

    if (success) {
      setIsOpen(false);
    }
  };

  const increment = () => {
    const current = Number(days) || 0;
    setDays(String(current + 1));
    setInputError(null);
  };

  const decrement = () => {
    const current = Number(days) || 0;
    if (current > 1) {
      setDays(String(current - 1));
      setInputError(null);
    }
  };

  return (
    <View className="flex-col gap-3">
      <Pressable
        onPress={() => {
          setInputError(null);
          setIsOpen((prev) => !prev);
        }}
        disabled={disabled}
        className="rounded-lg border border-sky-500/30 bg-sky-500/20 px-4 py-2 disabled:opacity-50"
      >
        <Text className="text-center text-sky-300">Review in</Text>
      </Pressable>

      {isOpen && (
        <View className="gap-2 rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
          <Text className="text-sm font-medium text-neutral-300">
            Delay in days
          </Text>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={decrement}
              disabled={disabled}
              className="rounded-lg border border-neutral-700 bg-neutral-900 p-2 disabled:opacity-50"
            >
              <Minus size={18} color="#e5e5e5" />
            </Pressable>

            <TextInput
              value={days}
              onChangeText={(value) => {
                setDays(value);
                setInputError(null);
              }}
              keyboardType="numeric"
              editable={!disabled}
              className="w-20 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-white"
            />

            <Pressable
              onPress={increment}
              disabled={disabled}
              className="rounded-lg border border-neutral-700 bg-neutral-900 p-2 disabled:opacity-50"
            >
              <Plus size={18} color="#e5e5e5" />
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={disabled}
              className="rounded-lg border border-neutral-700 px-4 py-2 disabled:opacity-50"
            >
              <Text className="text-neutral-200">Confirm</Text>
            </Pressable>
          </View>

          {inputError && (
            <Text className="text-sm text-red-400">{inputError}</Text>
          )}
        </View>
      )}
    </View>
  );
}
