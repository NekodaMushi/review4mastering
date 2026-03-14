import * as SecureStore from "expo-secure-store";

const SESSION_TOKEN_KEY = "session_token";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
}

interface AuthSuccessWithSession {
  data: { session: Session; user: User };
  error?: undefined;
}

interface AuthSuccessNoSession {
  data: null;
  error?: undefined;
}

interface AuthError {
  data?: undefined;
  error: { message: string };
}

export type AuthResult = AuthSuccessWithSession | AuthSuccessNoSession | AuthError;

async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}

export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleAuthResponse(response: Response): Promise<AuthResult> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return {
      error: {
        message:
          body?.message ?? body?.error ?? `Request failed (${response.status})`,
      },
    };
  }

  const body = await response.json();

  const session: Session | undefined = body.session ?? body.data?.session;
  const user: User | undefined = body.user ?? body.data?.user;

  if (session?.token) {
    await storeToken(session.token);
  }

  if (session && user) {
    return { data: { session, user } };
  }

  // Success but no session (e.g., sign-up with email verification required)
  return { data: null };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleAuthResponse(response);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<AuthResult> {
  const response = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ email, password, name }),
  });
  return handleAuthResponse(response);
}

export async function signOut(): Promise<void> {
  const headers = await authHeaders();
  await fetch(`${API_BASE_URL}/api/auth/sign-out`, {
    method: "POST",
    headers,
  });
  await clearToken();
}

async function postSimple(
  path: string,
  body: Record<string, unknown>,
): Promise<{ error?: { message: string } }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return { error: { message: data?.message ?? "Request failed" } };
  }

  return {};
}

export function requestPasswordReset(email: string) {
  return postSimple("/api/auth/request-password-reset", {
    email,
    redirectTo: "/reset-password",
  });
}

export function resetPassword(token: string, newPassword: string) {
  return postSimple("/api/auth/reset-password", { token, newPassword });
}

export function sendVerificationEmail(email: string) {
  return postSimple("/api/auth/send-verification-email", { email });
}

export async function getSession(): Promise<AuthResult> {
  const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
    method: "GET",
    headers: await authHeaders(),
  });
  return handleAuthResponse(response);
}
