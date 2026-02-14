/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'serif': ['Noto Serif SC', 'serif'],
      },
      colors: {
        parchment: {
          DEFAULT: '#E8D5A8',
          light: '#F5E6C8',
          dark: '#C4A96A',
          darker: '#8B7340',
        },
        wei: '#4A90D9',
        shu: '#D94A4A',
        wu: '#4AD97A',
        ink: '#2C1810',
        'ink-light': '#5C4033',
      },
    },
  },
  plugins: [],
}
