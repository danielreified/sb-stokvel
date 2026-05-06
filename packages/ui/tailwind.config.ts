import type { Config } from 'tailwindcss';
import preset from './tailwind.preset.js';

const config: Config = {
  ...preset,
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      ...preset.theme?.extend,
      colors: {
        ...preset.theme?.extend?.colors,
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
    },
  },
};

export default config;
