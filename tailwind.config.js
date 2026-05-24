/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          red: '#C41E2A',
          gold: '#F5A623',
          dark: '#1C1C1E',
          surface: '#2A2A2E',
          border: '#3A3A3E',
        },
      },
    },
  },
  plugins: [],
};
