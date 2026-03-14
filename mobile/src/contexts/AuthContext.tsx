import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  id: string;
  token: string;
}

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
    // Placeholder: restore session from secure storage
    setState((prev) => ({ ...prev, isPending: false }));
  }, []);

  const signIn = useCallback(
    async (_email: string, _password: string) => {
      // Placeholder: implement sign-in via API
      return { error: { message: "Not implemented" } };
    },
    [],
  );

  const signUp = useCallback(
    async (_email: string, _password: string, _name: string) => {
      // Placeholder: implement sign-up via API
      return { error: { message: "Not implemented" } };
    },
    [],
  );

  const signOut = useCallback(async () => {
    setState({ user: null, session: null, isPending: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signIn, signUp, signOut }),
    [state, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
