/** Dark amber color palette for the Review4Mastering mobile app. */

export const colors = {
  /** Background surfaces. */
  background: {
    /** Main screen background (neutral-950). */
    primary: "#0a0a0a",
    /** Card / container background (neutral-900). */
    card: "#171717",
    /** Elevated surface background (neutral-800). */
    elevated: "#262626",
  },

  /** Border colors. */
  border: {
    /** Default border (neutral-800). */
    default: "#262626",
    /** Subtle / low-contrast border (neutral-850). */
    subtle: "#1c1c1c",
  },

  /** Text colors. */
  text: {
    /** Primary text (white). */
    primary: "#ffffff",
    /** Secondary text (neutral-400). */
    secondary: "#a3a3a3",
    /** Muted / placeholder text (neutral-500). */
    muted: "#737373",
  },

  /** Accent / brand colors. */
  accent: {
    /** Primary accent (amber-400). */
    primary: "#fbbf24",
    /** Secondary accent (amber-500). */
    secondary: "#f59e0b",
    /** Gradient stops for decorative elements. */
    gradient: ["#fbbf24", "#f97316"] as const,
  },

  /** Semantic status colors. */
  status: {
    /** Error / destructive (red-500). */
    error: "#ef4444",
    /** Success (green-500). */
    success: "#22c55e",
    /** Warning (yellow-500). */
    warning: "#eab308",
  },
} as const;
