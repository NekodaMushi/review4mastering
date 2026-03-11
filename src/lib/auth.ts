import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  buildEmailVerificationEmail,
  buildPasswordChangedEmail,
  buildPasswordResetEmail,
} from "@/lib/auth-email";

const PASSWORD_RESET_TOKEN_TTL_SECONDS = 60 * 10;
const EMAIL_VERIFICATION_TOKEN_TTL_SECONDS = 60 * 60;

function toOrigin(rawUrl?: string) {
  if (!rawUrl) {
    return null;
  }

  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

function getTrustedOrigins() {
  const origins = new Set<string>();

  const configuredOrigins = [
    toOrigin(process.env.NEXT_PUBLIC_APP_URL),
    toOrigin(process.env.BETTER_AUTH_URL),
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ];

  for (const origin of configuredOrigins) {
    if (origin) {
      origins.add(origin);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return Array.from(origins);
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24, // refresh session
    cookieCache: {
      enabled: true,
      maxAge: 60 * 10, // 10 min client-side cache to avoid unnecessary DB calls
    },
  },
  trustedOrigins: getTrustedOrigins(),
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "database",
    customRules: {
      "/request-password-reset": {
        window: 3600,
        max: 3,
      },
      "/reset-password": {
        window: 3600,
        max: 5,
      },
      "/send-verification-email": {
        window: 3600,
        max: 3,
      },
      "/sign-in/email": {
        window: 300,
        max: 5,
      },
      "/sign-up/email": {
        window: 3600,
        max: 5,
      },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
    useSecureCookies: true,
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: PASSWORD_RESET_TOKEN_TTL_SECONDS,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      const email = buildPasswordResetEmail({
        name: user.name,
        resetUrl: url,
        expiresInMinutes: PASSWORD_RESET_TOKEN_TTL_SECONDS / 60,
      });

      await sendEmail({
        to: user.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
    },
    onPasswordReset: async ({ user }) => {
      console.log(`✅ Password reset for ${user.email}`);

      const email = buildPasswordChangedEmail({
        name: user.name,
      });

      await sendEmail({
        to: user.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: EMAIL_VERIFICATION_TOKEN_TTL_SECONDS,
    sendVerificationEmail: async ({ user, url }) => {
      const email = buildEmailVerificationEmail({
        name: user.name,
        verificationUrl: url,
        expiresInHours: EMAIL_VERIFICATION_TOKEN_TTL_SECONDS / (60 * 60),
      });

      await sendEmail({
        to: user.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
    },
  },
});
