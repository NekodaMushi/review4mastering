import { safeFetch } from "@/lib/utils/fetch-utils";
import { getAuthToken } from "@/lib/storage";
import type { NoteRecord } from "@/types/note";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
    ...(options?.headers as Record<string, string> | undefined),
  };

  const result = await safeFetch<T>(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data as T;
}

export const apiClient = {
  async getNotes(archived?: boolean): Promise<NoteRecord[]> {
    const query = archived ? "?archived=true" : "";
    return apiRequest<NoteRecord[]>(`/api/notes${query}`);
  },

  async getNote(id: string): Promise<NoteRecord> {
    const notes = await apiRequest<NoteRecord[]>("/api/notes");
    const note = notes.find((n) => n.id === id);
    if (!note) {
      throw new Error(`Note with id ${id} not found`);
    }
    return note;
  },

  async createNote(data: {
    name: string;
    text: string;
    link?: string;
  }): Promise<NoteRecord> {
    return apiRequest<NoteRecord>("/api/notes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteNote(id: string): Promise<void> {
    await apiRequest<void>(`/api/notes/${id}`, {
      method: "DELETE",
    });
  },

  async archiveNote(id: string, archived: boolean): Promise<void> {
    await apiRequest<void>(`/api/notes/${id}/archive`, {
      method: "PATCH",
      body: JSON.stringify({ archived }),
    });
  },

  async reviewNote(
    id: string,
    payload: { action: string } | { reviewInDays: number }
  ): Promise<void> {
    await apiRequest<void>(`/api/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
