/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1c1b19',
        surface: '#262624',
        surface2: '#2f2e2b',
        line: 'rgba(255,255,255,0.09)',
        text: '#ecebe4',
        muted: '#a09d94',
        blue: '#5b9cff',
        bluedeep: '#3b82f6',
        bluesoft: '#8fbcff',
        good: '#5fd08a',
        bad: '#f0726a',
        warn: '#e8b34a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
