import type { Meta, StoryObj } from '@storybook/react';
import { RecommendedUpdateBanner } from './_chrome/RecommendedUpdateBanner.js';

const meta: Meta<typeof RecommendedUpdateBanner> = {
  title: 'Status/RecommendedUpdateBanner',
  component: RecommendedUpdateBanner,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof RecommendedUpdateBanner>;

export const Default: Story = {};
