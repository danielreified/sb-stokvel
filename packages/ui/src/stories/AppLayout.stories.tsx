import type { Meta, StoryObj } from '@storybook/react';
import { AppWindow } from './_chrome/AppWindow.js';
import { DemoShell } from './_chrome/DemoShell.js';

const meta: Meta<typeof AppWindow> = {
  title: 'Layout/AppLayout',
  component: AppWindow,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <DemoShell>
        <Story />
      </DemoShell>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AppWindow>;

export const Dashboard: Story = {
  args: { initialPage: 'dashboard' },
};

export const Members: Story = {
  args: { initialPage: 'members' },
};

export const Contributions: Story = {
  args: { initialPage: 'contributions' },
};

export const Profile: Story = {
  args: { initialPage: 'profile' },
};
