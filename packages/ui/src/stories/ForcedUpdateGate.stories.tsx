import type { Meta, StoryObj } from '@storybook/react';
import { AppWindow } from './_chrome/AppWindow.js';
import { DemoShell } from './_chrome/DemoShell.js';
import { ForcedUpdateGate } from './_chrome/ForcedUpdateGate.js';

const meta: Meta<typeof ForcedUpdateGate> = {
  title: 'Gates/ForcedUpdateGate',
  component: ForcedUpdateGate,
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

type Story = StoryObj<typeof ForcedUpdateGate>;

export const ForcedUpdate: Story = {
  args: { variant: 'forced' },
};

export const MaxStaleness: Story = {
  args: { variant: 'maxStaleness' },
};
