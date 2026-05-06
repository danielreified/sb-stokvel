import type { Meta, StoryObj } from '@storybook/react';
import { AppWindow } from './_chrome/AppWindow.js';
import { DemoShell } from './_chrome/DemoShell.js';
import { PinLockScreen } from './_chrome/PinLockScreen.js';

const meta: Meta<typeof PinLockScreen> = {
  title: 'Gates/PinLockScreen',
  component: PinLockScreen,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <DemoShell>
        <AppWindow>
          <Story />
        </AppWindow>
      </DemoShell>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PinLockScreen>;

export const PinLock: Story = {
  args: { name: 'Nomsa' },
};

export const PinLockWithError: Story = {
  args: {
    name: 'Nomsa',
    error: 'Incorrect PIN — 2 attempts remaining',
  },
};
