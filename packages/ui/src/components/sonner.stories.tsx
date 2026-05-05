import type { Meta, StoryObj } from '@storybook/react';
import { toast } from 'sonner';
import { Button } from './button.js';
import { Toaster } from './sonner.js';

const meta: Meta<typeof Toaster> = {
  title: 'UI/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Toaster>;

export const Success: Story = {
  render: () => (
    <Button onClick={() => toast.success('Contribution received', { description: 'R500 from Thabo Nkosi for December 2024.' })}>
      Show success toast
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button variant="destructive" onClick={() => toast.error('Payment failed', { description: 'Could not process Naledi\'s R500 contribution. Please try again.' })}>
      Show error toast
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.info('Update available', { description: 'A new version of Seyva is ready. Refresh to update.' })}>
      Show info toast
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.warning('Offline mode', { description: 'Contributions cannot be submitted without a network connection.' })}>
      Show warning toast
    </Button>
  ),
};

export const AllToasts: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.success('R500 contribution recorded')}>
        Success
      </Button>
      <Button variant="destructive" onClick={() => toast.error('Payment failed')}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.info('App update available')}>
        Info
      </Button>
      <Button variant="outline" onClick={() => toast.warning('You are offline')}>
        Warning
      </Button>
    </div>
  ),
};
