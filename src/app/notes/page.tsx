"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { note } from "@prisma/client";
import {
  ArrowLeftIcon,
  Bell,
  Plus,
  MoreVertical,
  CheckCheck,
  Archive,
  Clock,
  Trash2,
  X,
} from "lucide-react";
import { AddNote } from "@/components/AddNote";
import { ReviewNote } from "@/components/ReviewNote";
import { SwipeableNoteCard } from "@/components/SwipeableNoteCard";
import { NotificationPanel } from "@/components/NotificationPanel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LifeLine } from "react-loading-indicators";

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<note | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const [selectionMode, setSelectionMode] = useState<
    "delete" | "archive" | null
  >(null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const hasNotes = notes.length > 0;

  const handleNoteClick = (note: note) => {
    if (selectionMode) {
      setSelectedNotes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(note.id)) {
          newSet.delete(note.id);
        } else {
          newSet.add(note.id);
        }
        return newSet;
      });
    } else {
      setSelectedNote(note);
      setIsReviewModalOpen(true);
    }
  };

  const handleReviewComplete = () => {
    fetchNotes();
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveNote = async (noteId: string) => {
    try {
      await fetch(`/api/notes/${noteId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const enterSelectionMode = (mode: "delete" | "archive") => {
    setSelectionMode(mode);
    setSelectedNotes(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(null);
    setSelectedNotes(new Set());
  };

  const openConfirmDialog = () => {
    if (selectedNotes.size === 0) return;
    setIsConfirmDialogOpen(true);
  };

  const handleBatchAction = async () => {
    setIsProcessing(true);
    setIsConfirmDialogOpen(false);

    try {
      const promises = Array.from(selectedNotes).map((noteId) => {
        if (selectionMode === "delete") {
          return fetch(`/api/notes/${noteId}`, { method: "DELETE" });
        } else if (selectionMode === "archive") {
          return fetch(`/api/notes/${noteId}/archive`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ archived: true }),
          });
        }
      });

      await Promise.all(promises);
      await fetchNotes();
      exitSelectionMode();
    } catch (error) {
      console.error("Error during batch action:", error);
      alert("An error occurred during the operation");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-neutral-500 hover:text-white transition-colors"
                aria-label="Dashboard"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="font-[family-name:var(--font-sora)] text-2xl sm:text-3xl font-bold">
                My Notes
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {hasNotes && (
                <>
                  <button
                    onClick={() => setIsNotificationPanelOpen(true)}
                    disabled={!!selectionMode}
                    className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-colors disabled:opacity-40"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!!selectionMode}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 font-semibold text-sm hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                    New Note
                  </button>

                  {/* Menu Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        disabled={!!selectionMode}
                        className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800/60 transition-colors disabled:opacity-40"
                        aria-label="More options"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-neutral-800 text-neutral-300">
                      <DropdownMenuItem className="hover:bg-neutral-800 focus:bg-neutral-800">
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark all Reviewed
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-neutral-800 focus:bg-neutral-800">
                        <Clock className="mr-2 h-4 w-4" />
                        Snooze all
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-neutral-800" />

                      <DropdownMenuItem
                        onClick={() => enterSelectionMode("archive")}
                        className="hover:bg-neutral-800 focus:bg-neutral-800"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive notes
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-neutral-800" />

                      <DropdownMenuItem
                        onClick={() => enterSelectionMode("delete")}
                        className="hover:bg-neutral-800 focus:bg-neutral-800 text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete notes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>

          {/* Barre de sélection active */}
          {selectionMode && (
            <div
              className={`mt-4 rounded-lg p-4 flex items-center justify-between ${
                selectionMode === "delete"
                  ? "bg-red-500/10 border border-red-500/30"
                  : "bg-emerald-500/10 border border-emerald-500/30"
              }`}
            >
              <div className="flex items-center gap-3">
                {selectionMode === "delete" ? (
                  <Trash2 className="h-5 w-5 text-red-400" />
                ) : (
                  <Archive className="h-5 w-5 text-emerald-400" />
                )}
                <div>
                  <p className="font-medium text-white">
                    {selectionMode === "delete"
                      ? "Delete Mode"
                      : "Archive Mode"}
                  </p>
                  <p className="text-sm text-neutral-400">
                    {selectedNotes.size} note
                    {selectedNotes.size !== 1 ? "s" : ""} selected
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exitSelectionMode}
                  disabled={isProcessing}
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-900 hover:text-white"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={openConfirmDialog}
                  disabled={selectedNotes.size === 0 || isProcessing}
                  className={
                    selectionMode === "delete"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      {selectionMode === "delete" ? (
                        <Trash2 className="mr-2 h-4 w-4" />
                      ) : (
                        <Archive className="mr-2 h-4 w-4" />
                      )}
                      {selectionMode === "delete" ? "Delete" : "Archive"} (
                      {selectedNotes.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <LifeLine color="#f59e0b" size="medium" text="" textColor="" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/50 rounded-lg border border-neutral-800">
            <p className="text-neutral-400 text-lg mb-6">
              No notes yet. Create your first note to get started!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 rounded-lg hover:from-amber-300 hover:to-amber-400 font-semibold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all"
            >
              + Add First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {notes.map((n) => (
              <SwipeableNoteCard
                key={n.id}
                note={n}
                onDelete={handleDeleteNote}
                onArchive={handleArchiveNote}
                onClick={handleNoteClick}
                selectionMode={selectionMode}
                isSelected={selectedNotes.has(n.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AddNote
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNoteCreated={fetchNotes}
      />

      <ReviewNote
        note={selectedNote}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onActionComplete={handleReviewComplete}
      />

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />

      {/* Confirmation */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              {selectionMode === "delete" ? (
                <>
                  This action will permanently delete {selectedNotes.size} note
                  {selectedNotes.size !== 1 ? "s" : ""}. This action cannot be
                  undone.
                </>
              ) : (
                <>
                  This action will archive {selectedNotes.size} note
                  {selectedNotes.size !== 1 ? "s" : ""}.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isProcessing}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchAction}
              disabled={isProcessing}
              className={
                selectionMode === "delete"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }
            >
              {isProcessing
                ? "Processing..."
                : selectionMode === "delete"
                ? "Delete All"
                : "Archive All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
