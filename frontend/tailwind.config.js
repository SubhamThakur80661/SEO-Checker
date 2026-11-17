/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#F2EFE9',
        paper: '#FBFAF7',
        sand: '#D6C9B3',
        olive: '#B5C19E',
        sage: '#8B957B',
        moss: '#5F6B4C',
        bark: '#645D51',
        olivewood: '#343831',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(52, 56, 49, 0.05), 0 4px 16px rgba(52, 56, 49, 0.05)',
        lift: '0 2px 4px rgba(52, 56, 49, 0.06), 0 12px 28px rgba(52, 56, 49, 0.10)',
      },
    },
  },
  plugins: [],
}
