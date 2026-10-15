import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary canvas
        "void-black": {
          DEFAULT: "#0B0B0E",
          raised: "#111114", // slightly lifted panel surface
        },
        // Secondary surfaces / borders / badges
        "deep-claret": {
          DEFAULT: "#4A121E",
          deep: "#581825",
          border: "#5C2230",
        },
        // Primary interactive / highlight color
        "ocean-blue": {
          DEFAULT: "#0077B6",
          deep: "#0F52BA",
          bright: "#2E9BD6",
        },
        // Text
        "text-primary": "#F3F4F6",
        "text-muted": "#9CA3AF",
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
      },
      maxWidth: {
        prose: "68ch",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
      boxShadow: {
        drawer: "-16px 0 48px rgba(0, 0, 0, 0.55)",
        card: "0 1px 0 rgba(243, 244, 246, 0.04)",
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-in": "slide-in 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
