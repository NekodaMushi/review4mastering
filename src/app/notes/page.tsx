"use client";

import { useEffect, useState } from "react";
import { note } from "@prisma/client";
import { AddNote } from "@/components/AddNote";
import { ReviewNote } from "@/components/ReviewNote";
import { SwipeableNoteCard } from "@/components/SwipeableNoteCard";

export default function NotesPage() {
  const [notes, setNotes] = useState<note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<note | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
    setSelectedNote(note);
    setIsReviewModalOpen(true);
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
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Notes</h1>
          {hasNotes && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              + Add Note
            </button>
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
    </div>
  );
}
