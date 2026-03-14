import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { X } from "lucide-react-native";
import { z } from "zod";
import { API_BASE_URL, authHeaders } from "@/lib/auth-client";

const createNoteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  text: z.string().min(1, "Description is required"),
  link: z.string().url().optional().or(z.literal("")),
});

interface AddNoteProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated: () => void;
}

export function AddNote({ isOpen, onClose, onNoteCreated }: AddNoteProps) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setName("");
      setText("");
      setLink("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = createNoteSchema.parse({
        name: name || "Untitled Note",
        text,
        link: link || undefined,
      });

      const res = await fetch(`${API_BASE_URL}/api/notes`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create note");
      }

      onNoteCreated();
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors.map((e) => e.message).join(", "));
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center bg-black/60 px-4">
          <View className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Add New Note"
                placeholderTextColor="#737373"
                className="flex-1 text-2xl font-bold text-white"
              />
              <Pressable onPress={onClose} className="ml-2 p-1">
                <X size={24} color="#737373" />
              </Pressable>
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="mb-1 text-sm font-medium text-neutral-400">
                Description *
              </Text>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="What do you want to remember about this?"
                placeholderTextColor="#737373"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className="rounded-lg border border-neutral-700 bg-neutral-800/80 px-4 py-3 text-sm text-white"
              />
            </View>

            {/* Link */}
            <View className="mb-4">
              <Text className="mb-1 text-sm font-medium text-neutral-400">
                Link (Optional)
              </Text>
              <TextInput
                value={link}
                onChangeText={setLink}
                placeholder="https://example.com"
                placeholderTextColor="#737373"
                keyboardType="url"
                autoCapitalize="none"
                className="rounded-lg border border-neutral-700 bg-neutral-800/80 px-4 py-3 text-sm text-white"
              />
            </View>

            {/* Error */}
            {error && (
              <View className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <Text className="text-sm text-red-400">{error}</Text>
              </View>
            )}

            {/* Buttons */}
            <View className="flex-row justify-end gap-2 pt-2">
              <Pressable
                onPress={onClose}
                className="rounded-lg border border-neutral-700 px-4 py-2"
              >
                <Text className="text-neutral-400">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                disabled={loading || !text.trim()}
                className="rounded-lg bg-amber-500 px-4 py-2 disabled:opacity-60"
              >
                <Text className="font-semibold text-neutral-950">
                  {loading ? "Creating..." : "Add Note"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
