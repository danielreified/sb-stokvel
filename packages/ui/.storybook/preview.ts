import type { Preview } from '@storybook/react';
import '../src/globals.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'brand', value: '#0033A0' },
        { name: 'gray', value: '#f9fafb' },
      ],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
