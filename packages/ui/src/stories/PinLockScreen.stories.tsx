import type { Meta, StoryObj } from '@storybook/react';
import { DemoShell } from './_chrome/DemoShell.js';
import { PinLockScreen } from './_chrome/PinLockScreen.js';

const meta: Meta<typeof PinLockScreen> = {
  title: 'Gates/PinLockScreen',
  component: PinLockScreen,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <DemoShell>
        <div className="h-full w-full overflow-hidden bg-background lg:rounded-2xl lg:border lg:shadow-2xl">
          <Story />
        </div>
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
