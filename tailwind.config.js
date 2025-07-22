/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        marvelRed: '#ED1D24',
        marvelBlack: '#202020',
        marvelGray: '#1C1C1C',
        marvelWhite: '#FFFFFF',
        marvelYellow: '#FFD700',
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
