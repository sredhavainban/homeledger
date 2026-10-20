/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        background: "#0f1117",
        surface: {
          DEFAULT: "#1a1d27",
          hover: "#222636",
        },
        border: "#2a2e3e",
        foreground: "#e4e6ef",
        muted: "#8b8fa3",
        primary: {
          DEFAULT: "#6366f1",
          hover: "#818cf8",
          muted: "rgba(99, 102, 241, 0.15)",
        },
        success: {
          DEFAULT: "#22c55e",
          muted: "rgba(34, 197, 94, 0.15)",
        },
        warning: {
          DEFAULT: "#f59e0b",
          muted: "rgba(245, 158, 11, 0.15)",
        },
        danger: {
          DEFAULT: "#ef4444",
          muted: "rgba(239, 68, 68, 0.15)",
        },
        income: "#22c55e",
        expense: "#ef4444",
        ink: { DEFAULT: "#15202B", soft: "#4A5866", faint: "#8795A3" },
        paper: { DEFAULT: "#F3F5F7", card: "#FFFFFF", line: "#DDE3E9" },
        spend: "#C8452D",
        earn: "#0F7B63",
        brand: "#1F4E79",
      },
    },
  },
  plugins: [],
};
