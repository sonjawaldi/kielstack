/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        ink: '#02030a',
        electric: '#087cff',
        neon: '#6b21ff',
        magenta: '#bd19ff'
      },
      boxShadow: {
        neon: '0 0 36px rgba(8, 124, 255, 0.32)',
        purple: '0 0 42px rgba(189, 25, 255, 0.25)'
      }
    }
  },
  plugins: []
};
