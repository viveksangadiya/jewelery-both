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
          50:  '#FAF9EE', // Ivory — main background
          100: '#EBEBCA', // Beige — secondary panels
          200: '#d9d4a0',
          300: '#B68868', // Chamoisee — warm accent
          400: '#a07252',
          500: '#8a5535',
          600: '#903E1D', // Brown — primary brand
          700: '#7a3318',
          800: '#642308', // Seal Brown — dark headings / footer
          900: '#3e1505', // Very dark brown
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer':  'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: 0 },                                          '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 },           '100%': { transform: 'translateY(0)', opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' },                       '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
