import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

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
  rateLimit: {
  enabled: true,
  window: 60,
  max: 100, // global limit
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
    "/sign-in/email": {
      window: 300,
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
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password - Review4Mastering",
        text: `Click this link to reset your password: ${url}`,
        html: `
          <h2>Password reset</h2>
          <p>Hello ${user.name || "user"},</p>
          <p>You requested to reset your password.</p>
          <p><a href="${url}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset my password</a></p>
          <p>This link expires in 10 minutes.</p>
          <p>If you did not request this reset, please ignore this email.</p>
        `,
      });
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`✅ Password reset for ${user.email}`);

      await sendEmail({
        to: user.email,
        subject: "Password changed",
        text: "Your password has been changed successfully.",
      });
    },
    // Test config
    /*
    trustedOrigins: [
      "http://localhost:3000",
      "http://192.168.0.103:3000",
    ],*/
  },
});
