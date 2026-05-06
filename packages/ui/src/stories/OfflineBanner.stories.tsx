import type { Meta, StoryObj } from '@storybook/react';
import { OfflineBanner } from './_chrome/OfflineBanner.js';

const meta: Meta<typeof OfflineBanner> = {
  title: 'Status/OfflineBanner',
  component: OfflineBanner,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof OfflineBanner>;

export const Default: Story = {};

export const CustomMessage: Story = {
  args: {
    message: 'No connection — contributions will resume when you’re back online.',
  },
};
