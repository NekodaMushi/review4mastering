/** A user record as stored in the database (mirrors Prisma `User`). */
export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/** A server-side session record (mirrors Prisma `Session`). */
export interface Session {
  id: string;
  token: string;
  expiresAt: Date | string;
  userId: string;
}

/** Client-side auth session shape used throughout the app. */
export interface AuthSession {
  user: User;
  session: Session;
}
