/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050308',
        abyss: '#0a0613',
        ink: '#0d0a1a',
        violet: {
          neon: '#6a00ff',
          glow: '#8b3bff',
          soft: '#b98bff',
          deep: '#3a0a86',
        },
        electric: '#3b82f6',
        cyan: '#46e0ff',
        cold: '#c9d2ff',
        corrupt: '#ff2d5e',
        gold: '#ffcb57',
        emerald: '#43ffb0',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        ui: ['"Chakra Petch"', 'sans-serif'],
        num: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 18px rgba(106,0,255,.55), 0 0 42px rgba(106,0,255,.28)',
        'glow-strong': '0 0 26px rgba(106,0,255,.9), 0 0 70px rgba(106,0,255,.45)',
        'glow-blue': '0 0 16px rgba(59,130,246,.55), 0 0 40px rgba(45,212,255,.25)',
        'glow-corrupt': '0 0 20px rgba(255,45,94,.6), 0 0 55px rgba(255,45,94,.3)',
      },
    },
  },
  plugins: [],
}
