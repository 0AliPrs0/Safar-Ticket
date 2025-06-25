/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#0D47A1',
        'secondary-blue': '#42A5F5',
        'accent-orange': '#FFA726',
        'light-bg': '#F8F9FA',
        'dark-text': '#212529',
      }
    },
  },
  plugins: [],
}