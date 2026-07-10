/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'sans-serif'],
      },
      colors: {
        primary: '#ed1c24', // Flame Red
        primaryDark: '#d1151c',
        surface: '#fcf9f8',
        surfaceDim: '#dcd9d9',
        surfaceBright: '#fcf9f8',
        surfaceContainerLowest: '#ffffff',
        surfaceContainerLow: '#f6f3f2',
        surfaceContainer: '#f0eded',
        surfaceContainerHigh: '#eae8e8',
        surfaceContainerHighest: '#e4e2e2',
        onSurface: '#1c1b1b',
        onSurfaceVariant: '#494544',
        outline: '#7a7574',
        outlineVariant: '#cbc4c3',
        brown: '#502314', // BK Brown
        orange: '#f2a900', // BK Orange
        footerBg: '#333333',
        footerText: '#d4d4d4'
      },
      borderRadius: {
        '8xl': '2rem',
      }
    }
  },
  plugins: [],
}
