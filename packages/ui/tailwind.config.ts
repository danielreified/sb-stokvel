import type { Config } from 'tailwindcss';
import preset from './tailwind.preset.js';

const config: Config = {
  ...preset,
  content: ['./src/**/*.{ts,tsx}'],
};

export default config;
