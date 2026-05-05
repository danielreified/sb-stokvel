import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0033A0',
          dark: '#002280',
          light: '#1A4DB5',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
