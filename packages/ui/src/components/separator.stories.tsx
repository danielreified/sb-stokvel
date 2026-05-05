import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './separator.js';

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div>
        <p className="text-sm font-medium">Thabo Nkosi</p>
        <p className="text-xs text-muted-foreground">R500 · December 2024</p>
      </div>
      <Separator />
      <div>
        <p className="text-sm font-medium">Naledi Dlamini</p>
        <p className="text-xs text-muted-foreground">R500 · December 2024</p>
      </div>
      <Separator />
      <div>
        <p className="text-sm font-medium">Sipho Khoza</p>
        <p className="text-xs text-muted-foreground">R500 · December 2024</p>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <span className="text-sm">Dashboard</span>
      <Separator orientation="vertical" className="h-4" />
      <span className="text-sm">Members</span>
      <Separator orientation="vertical" className="h-4" />
      <span className="text-sm">Contributions</span>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-72 rounded-lg border p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Total balance</span>
        <span className="font-bold">R 4 200</span>
      </div>
      <Separator />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Members paid</span>
        <span>6 / 8</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Next payout</span>
        <span>Sipho · Jan 2025</span>
      </div>
    </div>
  ),
};
