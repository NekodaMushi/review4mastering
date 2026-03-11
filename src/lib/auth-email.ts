const APP_NAME = "Review4Mastering";

function getAppUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL?.replace(/\/api\/auth\/?$/, ""),
    "http://localhost:3000",
  ];

  return candidates.find(Boolean) || "http://localhost:3000";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderEmailShell({
  eyebrow,
  heading,
  intro,
  ctaLabel,
  ctaUrl,
  outro,
}: {
  eyebrow: string;
  heading: string;
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
  outro: string;
}) {
  return `
    <div style="background:#09090b;padding:32px 16px;font-family:Arial,sans-serif;color:#fafafa;">
      <div style="max-width:560px;margin:0 auto;background:#171717;border:1px solid #262626;border-radius:16px;padding:32px;">
        <p style="margin:0 0 12px;color:#fbbf24;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#fafafa;">${escapeHtml(heading)}</h1>
        <p style="margin:0 0 24px;color:#d4d4d8;font-size:16px;line-height:1.6;">${escapeHtml(intro)}</p>
        <p style="margin:0 0 24px;">
          <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(180deg,#fbbf24,#f59e0b);color:#171717;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:10px;">
            ${escapeHtml(ctaLabel)}
          </a>
        </p>
        <p style="margin:0;color:#a1a1aa;font-size:14px;line-height:1.6;">${escapeHtml(outro)}</p>
      </div>
    </div>
  `.trim();
}

export function buildPasswordResetEmail({
  name,
  resetUrl,
  expiresInMinutes,
}: {
  name?: string | null;
  resetUrl: string;
  expiresInMinutes: number;
}) {
  const firstName = name?.trim() || "there";

  return {
    subject: `Reset your password - ${APP_NAME}`,
    text: [
      `Hi ${firstName},`,
      "",
      "We received a request to reset your password.",
      `Reset it here: ${resetUrl}`,
      "",
      `This link expires in ${expiresInMinutes} minutes.`,
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: renderEmailShell({
      eyebrow: "Password reset",
      heading: "Reset your password",
      intro: `Hi ${firstName}, use the secure link below to choose a new password.`,
      ctaLabel: "Reset password",
      ctaUrl: resetUrl,
      outro: `This link expires in ${expiresInMinutes} minutes. If you did not request this, you can ignore this email.`,
    }),
  };
}

export function buildPasswordChangedEmail({ name }: { name?: string | null }) {
  const firstName = name?.trim() || "there";

  return {
    subject: `Password changed - ${APP_NAME}`,
    text: [
      `Hi ${firstName},`,
      "",
      "Your password was changed successfully.",
      "If this was not you, reset your password immediately and review your account activity.",
    ].join("\n"),
    html: renderEmailShell({
      eyebrow: "Security alert",
      heading: "Your password was changed",
      intro: `Hi ${firstName}, this is a confirmation that your password has just been updated.`,
      ctaLabel: "Open Review4Mastering",
      ctaUrl: getAppUrl(),
      outro:
        "If you did not make this change, reset your password immediately and review your account activity.",
    }),
  };
}

export function buildEmailVerificationEmail({
  name,
  verificationUrl,
  expiresInHours,
}: {
  name?: string | null;
  verificationUrl: string;
  expiresInHours: number;
}) {
  const firstName = name?.trim() || "there";
  const expirationLabel =
    expiresInHours === 1 ? "1 hour" : `${expiresInHours} hours`;

  return {
    subject: `Verify your email - ${APP_NAME}`,
    text: [
      `Hi ${firstName},`,
      "",
      "Confirm your email address to finish securing your account.",
      `Verify your email here: ${verificationUrl}`,
      "",
      `This link expires in ${expirationLabel}.`,
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html: renderEmailShell({
      eyebrow: "Email verification",
      heading: "Verify your email",
      intro: `Hi ${firstName}, confirm your email address to finish securing your account.`,
      ctaLabel: "Verify email",
      ctaUrl: verificationUrl,
      outro: `This link expires in ${expirationLabel}. If you did not create this account, you can ignore this email.`,
    }),
  };
}
