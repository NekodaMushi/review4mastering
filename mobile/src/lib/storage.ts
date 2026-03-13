import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "auth_token";
const SESSION_KEY = "session_data";

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function removeAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

export async function getSession(): Promise<Record<string, unknown> | null> {
  const data = await SecureStore.getItemAsync(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function setSession(session: Record<string, unknown>): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function removeSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
