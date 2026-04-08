/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        craft: {
          50:  '#ffffff',
          100: '#f5f5f5',
          200: '#e1e1e1',
          300: '#9b9b9b',
          400: '#6b6b6b',
          500: '#4a4a4a',
          600: '#363636',
          700: '#1c1c1c',
          800: '#141414',
          900: '#000000',
        },
        sale: '#e32c2b',
        success: '#347a07',
        'success-light': '#d4e3cb',
        star: '#ed8a00',
      },
      fontFamily: {
        sans:    ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        body:    ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'fluid-h1': 'clamp(1.375rem, 1.15rem + 0.98vw, 2rem)',
        'fluid-h2': 'clamp(1.25rem, 1.07rem + 0.78vw, 1.75rem)',
        'fluid-h3': 'clamp(1.125rem, 1.03rem + 0.39vw, 1.375rem)',
      },
      maxWidth: {
        'container': '85rem',
      },
      spacing: {
        'section': '3.75rem',
        'section-sm': '2.5rem',
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer':  'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
