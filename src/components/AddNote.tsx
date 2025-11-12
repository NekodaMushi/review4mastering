"use client";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setName("");
      setText("");
      setLink("");
      setIsEditingTitle(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
    }
  }, [isEditingTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = createNoteSchema.parse({
        name: name || "Untitled Note",
        text,
        link: link || undefined,
      });

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create note");
      }

      onNoteCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[28rem]">
        <div className="mb-6">
          {!isEditingTitle ? (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl font-bold text-gray-300 cursor-pointer hover:text-gray-400 transition"
            >
              Add New Note
            </h2>
          ) : (
            <input
              ref={titleInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => !name && setIsEditingTitle(false)}
              placeholder="Add New Note"
              className="text-2xl font-bold text-gray-900 placeholder:text-gray-300 
                         w-full outline-none border-none bg-transparent"
            />
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Description *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you want to remember about this?"
              rows={5}
              className="w-full px-3 py-2 rounded-md border border-gray-300
                         text-gray-900 placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         resize-y"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Link (Optional)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 rounded-md border border-gray-300
                         text-gray-900 placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700
                         disabled:opacity-60"
            >
              {loading ? "Creating..." : "Add Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
