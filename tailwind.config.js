/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./src/**/*.{js,ts,jsx,tsx,cljs}", // Include ClojureScript files for Tailwind to scan
    "./components/**/*.{js,ts,jsx,tsx,cljs}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        courier: ['"Courier Prime"', 'monospace'],
        jetbrains: ['"JetBrains Mono"', 'monospace'],
        inter: ['"Inter"', 'sans-serif'],
      },
      colors: {
        riso: {
          pink: '#F15060',
          blue: '#0078BF',
          yellow: '#FFE800',
          teal: '#00A95C',
          black: '#333333',
          paper: '#FDFBF7',
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}