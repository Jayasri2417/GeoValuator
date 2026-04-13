/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        legal: '0 4px 6px -1px rgba(15, 52, 96, 0.1), 0 2px 4px -1px rgba(15, 52, 96, 0.06)',
        emblem: '0 0 15px rgba(243, 156, 18, 0.3)',
      },
      colors: {
        geoGreen: {
          DEFAULT: '#1B4D3E',
          light: '#2C6E58',
          dark: '#0D2B22',
        },
        geoBlue: {
          DEFAULT: '#2C3E50',
          light: '#34495E',
        },
        geoGold: {
          DEFAULT: '#B48E43', // Muted Gold for Official use
          dim: '#8D6E33',
        },
        geoPaper: '#F8FAFC', // Slate-50
        // Government/Enterprise palette
        govBlue: '#1e3a8a', // Blue-900 (Official Navy)
        govGold: '#d97706', // Amber-600
        govText: '#334155', // Slate-700
      },
    },
  },
  plugins: [],
}
