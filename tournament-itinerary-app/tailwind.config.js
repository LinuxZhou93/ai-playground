/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#050a14',
          panel: '#0a192f',
          blue: '#00f2ff',
          green: '#00ff9d',
          orange: '#ff9d00',
          red: '#ff0055',
        }
      },
      backgroundImage: {
        'tech-grid': "radial-gradient(circle, rgba(0, 242, 255, 0.05) 1px, transparent 1px)",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
