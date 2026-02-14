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

  const inputClass =
    "w-full rounded-lg bg-neutral-800/80 border border-neutral-700 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 w-md">
        <div className="mb-6">
          {!isEditingTitle ? (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="font-[family-name:var(--font-sora)] text-2xl font-bold text-neutral-500 cursor-pointer hover:text-neutral-400 transition"
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
              className="font-[family-name:var(--font-sora)] text-2xl font-bold text-white placeholder:text-neutral-500
                         w-full outline-none border-none bg-transparent"
            />
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Description *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you want to remember about this?"
              rows={5}
              className={`${inputClass} resize-y`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Link (Optional)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 font-semibold hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20
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
