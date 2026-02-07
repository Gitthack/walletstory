/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { primary: "#0A0A0F", secondary: "#12121A", card: "#16161F", elevated: "#1C1C28" },
        border: "#2A2A3A",
        accent: "#C8A2FF",
        "accent-dim": "rgba(200,162,255,0.12)",
        parchment: { light: "#F5E6C8", DEFAULT: "#E8D5A8", dark: "#C4A96A", darker: "#8B7340" },
        kingdom: { wei: "#4A90D9", shu: "#D94A4A", wu: "#4AD97A", neutral: "#B8A080" },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        display: ["Noto Serif SC", "Ma Shan Zheng", "serif"],
        body: ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};
