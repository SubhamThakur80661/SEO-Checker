/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0B',
        coal: '#131315',
        panel: '#17171A',
        paper: '#F2F0EA',
        smoke: '#A3A39B',
        lime: '#D7FF3E',
        limedim: '#B8DE2E',
      },
      fontFamily: {
        display: ['Archivo', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.35)',
        lift: '0 2px 4px rgba(0, 0, 0, 0.4), 0 16px 40px rgba(0, 0, 0, 0.45)',
        lime: '0 0 0 1px #D7FF3E, 0 12px 40px rgba(215, 255, 62, 0.18)',
      },
    },
  },
  plugins: [],
}
