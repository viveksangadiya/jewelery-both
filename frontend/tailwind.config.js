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
        brand: {
          bg:        '#F5F0EB',
          card:      '#FFFFFF',
          dark:      '#111111',
          footer:    '#1a1a1a',
          border:    '#E0D9D0',
          text:      '#000000',
          secondary: '#6B6B6B',
          muted:     '#999999',
          hover:     '#EDE8E2',
          input:     '#F7F4F0',
        },
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
        sale:            '#e32c2b',
        success:         '#347a07',
        'success-light': '#d4e3cb',
        star:            '#ed8a00',
      },
      fontFamily: {
        sans:    ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        serif:   ['var(--font-playfair)', 'Georgia', '"Times New Roman"', 'serif'],
        display: ['var(--font-playfair)', 'Georgia', '"Times New Roman"', 'serif'],
        body:    ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'fluid-h1': 'clamp(1.75rem, 1.3rem + 1.5vw, 3rem)',
        'fluid-h2': 'clamp(1.375rem, 1.1rem + 1vw, 2rem)',
        'fluid-h3': 'clamp(1.125rem, 1rem + 0.5vw, 1.5rem)',
      },
      maxWidth: {
        container: '85rem',
      },
      spacing: {
        section:    '5rem',
        'section-sm': '3rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-in-out',
        'slide-up':   'slideUp 0.35s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'shimmer':    'shimmer 2s infinite linear',
        'menu-in':    'menuIn 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' },                                      '100%': { opacity: '1' } },
        slideUp:  { '0%': { transform: 'translateY(20px)', opacity: '0' },       '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown:{ '0%': { transform: 'translateY(-10px)', opacity: '0' },      '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' },                     '100%': { backgroundPosition: '200% 0' } },
        menuIn:   { '0%': { transform: 'translateX(-100%)', opacity: '0' },      '100%': { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
