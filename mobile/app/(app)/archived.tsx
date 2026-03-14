import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import {
  ArrowLeft,
  Trash2,
  X,
  Check,
  FileText,
} from "lucide-react-native";
import type { NoteRecord } from "@/types/note";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function ArchivedNotesScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes?archived=true`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.replace("/(auth)/sign-in");
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch archived notes");

      const data = (await response.json()) as NoteRecord[];
      setNotes(data);
    } catch (error) {
      console.error("Error fetching archived notes:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const handleDelete = async (noteId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete note");
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const toggleSelection = (noteId: string) => {
    setSelectedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  const enterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedNotes(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedNotes(new Set());
  };

  const handleBatchDelete = async () => {
    setIsProcessing(true);
    setIsConfirmOpen(false);

    try {
      const requests = Array.from(selectedNotes).map((id) =>
        fetch(`${API_BASE_URL}/api/notes/${id}`, {
          method: "DELETE",
          credentials: "include",
        })
      );

      const responses = await Promise.all(requests);

      if (responses.some((r) => !r.ok)) {
        throw new Error("Some deletions failed");
      }

      await fetchNotes();
      exitSelectionMode();
    } catch (error) {
      console.error("Batch delete error:", error);
      Alert.alert("Error", "An error occurred while deleting notes.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNotePress = (note: NoteRecord) => {
    if (selectionMode) {
      toggleSelection(note.id);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Loading state                                                    */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */

  return (
    <View className="flex-1 bg-neutral-950">
      {/* Header */}
      <View className="px-6 pb-4 pt-14">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              className="p-1"
            >
              <ArrowLeft size={20} color="#737373" />
            </Pressable>
            <Text className="text-2xl font-bold text-white">
              Archived Notes
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Link href="/(app)/notes" asChild>
              <Pressable className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2 active:bg-neutral-800">
                <Text className="text-sm text-neutral-300">Active Notes</Text>
              </Pressable>
            </Link>

            {notes.length > 0 && !selectionMode && (
              <Pressable
                onPress={enterSelectionMode}
                className="rounded-lg border border-neutral-700 bg-neutral-900/70 p-2 active:bg-neutral-800"
                accessibilityLabel="Delete notes"
              >
                <Trash2 size={18} color="#f87171" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Selection mode banner */}
        {selectionMode && (
          <View className="mt-4 flex-row items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <View className="flex-row items-center gap-3">
              <Trash2 size={20} color="#f87171" />
              <View>
                <Text className="font-medium text-white">Delete Mode</Text>
                <Text className="text-sm text-neutral-400">
                  {selectedNotes.size} note
                  {selectedNotes.size !== 1 ? "s" : ""} selected
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={exitSelectionMode}
                disabled={isProcessing}
                className="flex-row items-center rounded-lg border border-neutral-700 px-3 py-2 active:bg-neutral-900"
              >
                <X size={16} color="#a3a3a3" />
                <Text className="ml-1 text-sm text-neutral-400">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (selectedNotes.size > 0) setIsConfirmOpen(true);
                }}
                disabled={selectedNotes.size === 0 || isProcessing}
                className="flex-row items-center rounded-lg bg-red-600 px-3 py-2 active:bg-red-700 disabled:opacity-40"
              >
                <Trash2 size={16} color="#fff" />
                <Text className="ml-1 text-sm font-medium text-white">
                  Delete ({selectedNotes.size})
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Empty state */}
      {notes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center rounded-lg border border-neutral-800 bg-neutral-900/50 p-10">
            <FileText size={40} color="#525252" />
            <Text className="mt-4 text-lg text-neutral-400">
              No archived notes yet.
            </Text>
            <Link href="/(app)/notes" asChild>
              <Pressable className="mt-6 rounded-lg bg-amber-500 px-6 py-3 shadow-lg active:opacity-80">
                <Text className="text-sm font-semibold tracking-wide text-neutral-950">
                  Back to Notes
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      ) : (
        <FlatList<NoteRecord>
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-8 gap-3"
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              selectionMode={selectionMode}
              isSelected={selectedNotes.has(item.id)}
              onPress={() => handleNotePress(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}

      {/* Batch delete confirmation dialog */}
      <Modal
        visible={isConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConfirmOpen(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/60"
          onPress={() => setIsConfirmOpen(false)}
        >
          <Pressable onPress={() => {}}>
            <View className="w-80 gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <Text className="text-lg font-semibold text-neutral-100">
                Are you sure?
              </Text>
              <Text className="text-sm text-neutral-400">
                This will permanently delete {selectedNotes.size} note
                {selectedNotes.size !== 1 ? "s" : ""}. This action cannot be
                undone.
              </Text>

              <View className="flex-row justify-end gap-2">
                <Pressable
                  onPress={() => setIsConfirmOpen(false)}
                  disabled={isProcessing}
                  className="rounded-lg border border-neutral-700 px-4 py-2 active:bg-neutral-800"
                >
                  <Text className="text-sm text-neutral-300">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleBatchDelete}
                  disabled={isProcessing}
                  className="rounded-lg bg-red-600 px-4 py-2 active:bg-red-700"
                >
                  <Text className="text-sm font-medium text-white">
                    {isProcessing ? "Deleting..." : "Delete All"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  NoteCard — inline for archived notes (read-only, with delete)      */
/* ------------------------------------------------------------------ */

function NoteCard({
  note,
  selectionMode,
  isSelected,
  onPress,
  onDelete,
}: {
  note: NoteRecord;
  selectionMode: boolean;
  isSelected: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const archivedDate = note.archived_at
    ? new Date(note.archived_at).toLocaleDateString()
    : null;

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-lg border p-4 ${
        isSelected
          ? "border-red-500/50 bg-red-500/10"
          : "border-neutral-800 bg-neutral-900"
      } active:opacity-80`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            {selectionMode && (
              <View
                className={`h-5 w-5 items-center justify-center rounded border ${
                  isSelected
                    ? "border-red-400 bg-red-500"
                    : "border-neutral-600 bg-neutral-800"
                }`}
              >
                {isSelected && <Check size={12} color="#fff" />}
              </View>
            )}
            <Text
              className="flex-1 text-base font-semibold text-white"
              numberOfLines={1}
            >
              {note.name}
            </Text>
          </View>

          {note.text ? (
            <Text
              className="mt-1 text-sm text-neutral-400"
              numberOfLines={2}
            >
              {note.text}
            </Text>
          ) : null}

          {archivedDate ? (
            <Text className="mt-2 text-xs text-neutral-500">
              Archived {archivedDate}
            </Text>
          ) : null}
        </View>

        {!selectionMode && (
          <Pressable
            onPress={onDelete}
            className="ml-3 rounded-lg p-2 active:bg-neutral-800"
            accessibilityLabel={`Delete ${note.name}`}
          >
            <Trash2 size={16} color="#f87171" />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
