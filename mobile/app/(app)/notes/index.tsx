import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Archive,
  Bell,
  CheckCheck,
  Clock,
  MoreVertical,
  Plus,
  Trash2,
  X,
} from "lucide-react-native";

import { useAuth } from "@/lib/hooks/useAuth";
import { SwipeableNoteCard } from "@/components/SwipeableNoteCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import type { NoteRecord } from "@/types/note";
import { API_BASE_URL } from "@/lib/constants/api";

type SelectionMode = "delete" | "archive" | null;

async function requestNotes() {
  const response = await fetch(`${API_BASE_URL}/api/notes`);
  if (!response.ok) {
    return { response, data: null };
  }
  const data = (await response.json()) as NoteRecord[];
  return { response, data };
}

export default function NotesScreen() {
  const router = useRouter();
  const { user, isPending } = useAuth();

  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const hasNotes = notes.length > 0;

  const refreshNotes = useCallback(async () => {
    setLoading(true);
    try {
      const { response, data } = await requestNotes();

      if (response.status === 401) {
        router.replace("/(auth)/sign-in");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      if (data) {
        setNotes(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/(auth)/sign-in");
    }
  }, [isPending, router, user]);

  useEffect(() => {
    if (!isPending && user) {
      let isCancelled = false;

      void (async () => {
        setLoading(true);
        try {
          const { response, data } = await requestNotes();
          if (isCancelled) return;

          if (response.status === 401) {
            router.replace("/(auth)/sign-in");
            return;
          }

          if (!response.ok) {
            throw new Error("Failed to fetch notes");
          }

          if (data) {
            setNotes(data);
          }
        } catch (error) {
          if (!isCancelled) {
            console.error(error);
          }
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      })();

      return () => {
        isCancelled = true;
      };
    }
  }, [isPending, router, user]);

  const handleNoteClick = useCallback(
    (note: NoteRecord) => {
      if (selectionMode) {
        setSelectedNotes((prev) => {
          const next = new Set(prev);
          if (next.has(note.id)) {
            next.delete(note.id);
          } else {
            next.add(note.id);
          }
          return next;
        });
        return;
      }
      // Open review modal (not yet implemented for mobile)
    },
    [selectionMode]
  );

  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const handleArchiveNote = useCallback(
    async (noteId: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/notes/${noteId}/archive`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ archived: true }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to archive note");
        }

        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const enterSelectionMode = useCallback(
    (nextMode: Exclude<SelectionMode, null>) => {
      setSelectionMode(nextMode);
      setSelectedNotes(new Set());
    },
    []
  );

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(null);
    setSelectedNotes(new Set());
  }, []);

  const openConfirmDialog = useCallback(() => {
    if (selectedNotes.size === 0) return;
    setIsConfirmDialogOpen(true);
  }, [selectedNotes.size]);

  const handleBatchAction = useCallback(async () => {
    setIsProcessing(true);
    setIsConfirmDialogOpen(false);

    try {
      const requests = Array.from(selectedNotes).map((noteId) => {
        if (selectionMode === "delete") {
          return fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
            method: "DELETE",
          });
        }
        return fetch(`${API_BASE_URL}/api/notes/${noteId}/archive`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: true }),
        });
      });

      const responses = await Promise.all(requests);

      if (responses.some((r) => !r.ok)) {
        throw new Error("Batch action failed");
      }

      await refreshNotes();
      exitSelectionMode();
    } catch (error) {
      console.error("Error during batch action:", error);
      Alert.alert("Error", "An error occurred during the operation.");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedNotes, selectionMode, refreshNotes, exitSelectionMode]);

  const renderNoteItem = useCallback(
    ({ item }: { item: NoteRecord }) => (
      <SwipeableNoteCard
        note={item}
        archived={false}
        allowArchive
        onDelete={handleDeleteNote}
        onArchive={handleArchiveNote}
        onClick={handleNoteClick}
        selectionMode={selectionMode}
        isSelected={selectedNotes.has(item.id)}
      />
    ),
    [
      handleDeleteNote,
      handleArchiveNote,
      handleNoteClick,
      selectionMode,
      selectedNotes,
    ]
  );

  // Loading state
  if (isPending || loading || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <Spinner size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => router.push("/(app)/dashboard")}
                className="p-1"
              >
                <ArrowLeft size={20} color="#737373" />
              </Pressable>
              <Text className="font-[Sora-Bold] text-2xl text-white">
                My Notes
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Link href="/(app)/archived" asChild>
                <Pressable className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2">
                  <Text className="text-sm text-neutral-300">Archived</Text>
                </Pressable>
              </Link>

              {hasNotes ? (
                <>
                  <Pressable
                    onPress={() => {
                      // Notifications panel (not yet implemented)
                    }}
                    disabled={!!selectionMode}
                    className={`p-2 rounded-lg ${selectionMode ? "opacity-40" : ""}`}
                  >
                    <Bell size={20} color="#737373" />
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      // Open AddNote modal (not yet implemented)
                    }}
                    disabled={!!selectionMode}
                    className={`flex-row items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 ${
                      selectionMode ? "opacity-40" : ""
                    }`}
                  >
                    <Plus size={16} color="#0a0a0a" />
                    <Text className="text-sm font-semibold text-neutral-950">
                      New Note
                    </Text>
                  </Pressable>
                </>
              ) : null}

              {hasNotes ? (
                <DropdownMenu>
                  <DropdownMenuTrigger disabled={!!selectionMode}>
                    <View className="p-2 rounded-lg">
                      <MoreVertical size={20} color="#737373" />
                    </View>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      icon={<CheckCheck size={16} color="#a3a3a3" />}
                    >
                      Mark all Reviewed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      icon={<Clock size={16} color="#a3a3a3" />}
                    >
                      Snooze all
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onPress={() => enterSelectionMode("archive")}
                      icon={<Archive size={16} color="#a3a3a3" />}
                    >
                      Archive notes
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onPress={() => enterSelectionMode("delete")}
                      icon={<Trash2 size={16} color="#f87171" />}
                      variant="destructive"
                    >
                      Delete notes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </View>
          </View>

          {/* Selection mode banner */}
          {selectionMode ? (
            <View
              className={`mt-4 rounded-lg p-4 flex-row items-center justify-between ${
                selectionMode === "delete"
                  ? "bg-red-500/10 border border-red-500/30"
                  : "bg-emerald-500/10 border border-emerald-500/30"
              }`}
            >
              <View className="flex-row items-center gap-3">
                {selectionMode === "delete" ? (
                  <Trash2 size={20} color="#f87171" />
                ) : (
                  <Archive size={20} color="#34d399" />
                )}
                <View>
                  <Text className="font-medium text-white">
                    {selectionMode === "delete"
                      ? "Delete Mode"
                      : "Archive Mode"}
                  </Text>
                  <Text className="text-sm text-neutral-400">
                    {selectedNotes.size} note
                    {selectedNotes.size !== 1 ? "s" : ""} selected
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={exitSelectionMode}
                  disabled={isProcessing}
                >
                  <X size={16} color="#a3a3a3" />
                  <Text className="text-neutral-400 text-sm">Cancel</Text>
                </Button>
                <Button
                  size="sm"
                  onPress={openConfirmDialog}
                  disabled={selectedNotes.size === 0 || isProcessing}
                  className={
                    selectionMode === "delete"
                      ? "bg-red-600"
                      : "bg-emerald-600"
                  }
                >
                  {isProcessing ? (
                    <Text className="text-white text-sm">Processing...</Text>
                  ) : (
                    <>
                      {selectionMode === "delete" ? (
                        <Trash2 size={16} color="white" />
                      ) : (
                        <Archive size={16} color="white" />
                      )}
                      <Text className="text-white text-sm">
                        {selectionMode === "delete" ? "Delete" : "Archive"} (
                        {selectedNotes.size})
                      </Text>
                    </>
                  )}
                </Button>
              </View>
            </View>
          ) : null}
        </View>

        {/* Notes list */}
        {notes.length === 0 ? (
          <View className="flex-1 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 py-16">
            <Text className="text-neutral-400 text-lg mb-6">
              No notes yet. Create your first note to get started!
            </Text>
            <Pressable
              onPress={() => {
                // Open AddNote modal (not yet implemented)
              }}
              className="rounded-lg bg-amber-500 px-6 py-3 shadow-lg"
            >
              <Text className="text-sm font-semibold text-neutral-950">
                + Add First Note
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={notes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Batch action confirmation dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectionMode === "delete"
                ? `This action will permanently delete ${selectedNotes.size} note${selectedNotes.size !== 1 ? "s" : ""}. This action cannot be undone.`
                : `This action will archive ${selectedNotes.size} note${selectedNotes.size !== 1 ? "s" : ""}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              <Text className="text-neutral-300 text-sm font-medium">
                Cancel
              </Text>
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={handleBatchAction}
              disabled={isProcessing}
              className={
                selectionMode === "delete" ? "bg-red-600" : "bg-emerald-600"
              }
            >
              <Text className="text-white text-sm font-medium">
                {isProcessing
                  ? "Processing..."
                  : selectionMode === "delete"
                    ? "Delete All"
                    : "Archive All"}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}
