import preset from '@seyva/ui/tailwind.preset';
import type { Config } from 'tailwindcss';

export default {
  ...preset,
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
} satisfies Config;
