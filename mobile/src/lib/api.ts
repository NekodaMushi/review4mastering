export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

/**
 * POST JSON to an auth endpoint and return the parsed response.
 * Throws on network errors; returns `{ ok, data }` otherwise.
 */
export async function authPost<T = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const message =
      data?.error?.message || data?.message || "Something went wrong.";
    return { ok: false, message };
  }

  return { ok: true, data };
}
