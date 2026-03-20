/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./psyche_x_system/*.html",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        dark: '#030712'
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        noto: ['"Noto Sans SC"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        cyber: ['Orbitron', 'Noto Sans SC', 'sans-serif']
      }
    }
  },
  plugins: [],
}
