import type { Meta, StoryObj } from '@storybook/react';
import { DemoShell } from './_chrome/DemoShell.js';
import { RouteErrorPanel } from './_chrome/RouteErrorPanel.js';

const meta: Meta<typeof RouteErrorPanel> = {
  title: 'Status/RouteErrorPanel',
  component: RouteErrorPanel,
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

type Story = StoryObj<typeof RouteErrorPanel>;

export const Default: Story = {
  args: {
    message: 'Could not load contributions.',
    onRetry: () => {},
  },
};

export const WithDetail: Story = {
  args: {
    message: 'Could not load contributions.',
    detail: 'request id: 8f2c-4a91-bc03',
    onRetry: () => {},
  },
};

export const NoRetry: Story = {
  args: {
    message: 'This page is not available.',
  },
};
