import type { Meta, StoryObj } from '@storybook/react';
import { UpdatePromptToast } from './_chrome/UpdatePromptToast.js';

const meta: Meta<typeof UpdatePromptToast> = {
  title: 'Status/UpdatePromptToast',
  component: UpdatePromptToast,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof UpdatePromptToast>;

export const OptionalUpdate: Story = {};
