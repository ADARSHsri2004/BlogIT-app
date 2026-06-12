/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        muted: '#6b7280',
        accent: '#4f46e5',
        soft: '#f8fafc'
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'serif']
      }
    },
  },
  plugins: [],
};
