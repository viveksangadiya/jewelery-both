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
        coral:    { DEFAULT: '#FF4D4D', dark: '#E03E3E', light: '#FFE8E8' },
        gold:     { DEFAULT: '#FFB800', dark: '#E5A600', light: '#FFF3CC' },
        jet:      '#111111',
        ash:      '#F5F5F5',
        mist:     '#666666',
        border:   '#E8E8E8',
        // backward compat
        charcoal: '#111111',
        cream:    '#F5F5F5',
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        'full': '999px',
      },
      animation: {
        'fade-up':        'fade-up 0.5s ease forwards',
        'shimmer':        'shimmer 1.5s infinite',
        'slide-in-right': 'slide-in-right 0.28s cubic-bezier(0.32,0.72,0,1) forwards',
        'marquee':        'marquee 28s linear infinite',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
