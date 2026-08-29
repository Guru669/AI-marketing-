/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#faf8f5',
          100: '#f2ede7',
          200: '#e6dcd0',
          300: '#d3c3b0',
          400: '#a8957a',
          500: '#7d6849',
          600: '#6b5a42',
          700: '#4f4232',
          800: '#332b20',
          900: '#1f1a13',
          950: '#120f0a',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
