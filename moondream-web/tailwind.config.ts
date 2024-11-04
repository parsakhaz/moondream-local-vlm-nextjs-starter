/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          primary: '#ffffff',
          secondary: '#f3f4f6', 
          text: '#111827',
          border: '#e5e7eb',
          accent: '#3b82f6',
        },
        dark: {
          primary: '#1f2937',
          secondary: '#111827',
          text: '#f9fafb',
          border: '#374151',
          accent: '#60a5fa',
        }
      }
    },
  },
  plugins: [],
}

export default config