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
import { ButtonGroup } from "@/components/ui/button-group";
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
      // Mode normal: ouvrir la modal de review
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Review4Mastering
            </h1>

            {hasNotes ? (
              <ButtonGroup className="w-fit">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Dashboard"
                  onClick={() => router.push("/dashboard")}
                >
                  <ArrowLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsNotificationPanelOpen(true)}
                  disabled={!!selectionMode}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                  disabled={!!selectionMode}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>

                {/* Menu Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="More options"
                      disabled={!!selectionMode}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <CheckCheck className="mr-2 h-4 w-4" />
                      Mark as all Reviewed
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Clock className="mr-2 h-4 w-4" />
                      Snooze all
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => enterSelectionMode("archive")}
                    >
                      <Archive className="mr-2 h-4 w-4 text-green-700" />
                      Archive notes
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => enterSelectionMode("delete")}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      Trash notes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ButtonGroup>
            ) : (
              <ButtonGroup className="w-fit">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Dashboard"
                  onClick={() => router.push("/dashboard")}
                >
                  <ArrowLeftIcon />
                </Button>
              </ButtonGroup>
            )}
          </div>

          {/* Barre de sélection active */}
          {selectionMode && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectionMode === "delete" ? (
                  <Trash2 className="h-5 w-5 text-red-600" />
                ) : (
                  <Archive className="h-5 w-5 text-green-700" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {selectionMode === "delete"
                      ? "Delete Mode"
                      : "Archive Mode"}
                  </p>
                  <p className="text-sm text-gray-600">
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
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
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
          <div className="text-center py-12">
            <p className="text-gray-500">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg mb-4">
              No notes yet. Create your first note to get started!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
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
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchAction}
              disabled={isProcessing}
              className={
                selectionMode === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
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
