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
        sand: '#D6C9B3',
        olive: '#B5C19E',
        sage: '#8B957B',
        bark: '#645D51',
        olivewood: '#343831',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}