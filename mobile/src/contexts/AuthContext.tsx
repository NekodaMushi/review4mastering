import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User, Session } from "@/lib/auth-client";
import {
  signInWithEmail,
  signUpWithEmail,
  signOut as authSignOut,
  getSession,
} from "@/lib/auth-client";

interface AuthState {
  user: User | null;
  session: Session | null;
  isPending: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error?: { message: string } }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isPending: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const result = await getSession();

        if (cancelled) return;

        if (result.data) {
          setState({
            user: result.data.user,
            session: result.data.session,
            isPending: false,
          });
        } else {
          setState({ user: null, session: null, isPending: false });
        }
      } catch {
        if (!cancelled) {
          setState({ user: null, session: null, isPending: false });
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await signInWithEmail(email, password);

      if (result.data) {
        setState({
          user: result.data.user,
          session: result.data.session,
          isPending: false,
        });
        return {};
      }

      return { error: result.error };
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await signUpWithEmail(email, password, name);

      if (result.error) {
        return { error: result.error };
      }

      // Sign-up succeeded — session may be null if email verification is required
      if (result.data) {
        setState({
          user: result.data.user,
          session: result.data.session,
          isPending: false,
        });
      }

      return {};
    },
    [],
  );

  const signOut = useCallback(async () => {
    await authSignOut();
    setState({ user: null, session: null, isPending: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signIn, signUp, signOut }),
    [state, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
