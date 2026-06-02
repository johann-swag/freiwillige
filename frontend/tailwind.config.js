/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Freunde Waldorf brand colors
        brand: {
          orange:  '#c8540a',
          'orange-l': '#e06010',
          red:     '#d94f1e',
          dark:    '#1a1a18',
        },
        surface: {
          DEFAULT: '#ffffff',
          2: '#f8f6f3',
          3: '#f0ede6',
        },
      },
      fontFamily: {
        sans:  ['Source Sans 3', 'Arial', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
}
