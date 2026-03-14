import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        card: "#171717",
        border: "#262626",
        primary: "#fbbf24",
        "primary-foreground": "#0a0a0a",
        accent: "#f59e0b",
        "accent-foreground": "#0a0a0a",
        muted: "#a3a3a3",
        foreground: "#ffffff",
      },
      fontFamily: {
        sora: ["Sora"],
      },
    },
  },
  plugins: [],
};

export default config;
