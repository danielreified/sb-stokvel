import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge.js';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: 'Paid' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Pending' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Overdue' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Inactive' } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 p-4">
      <Badge>Paid</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Overdue</Badge>
      <Badge variant="outline">Inactive</Badge>
    </div>
  ),
};

export const ContributionStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm">Thabo Nkosi</span>
        <Badge>Paid</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Naledi Dlamini</span>
        <Badge variant="secondary">Pending</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Sipho Khoza</span>
        <Badge variant="destructive">Overdue</Badge>
      </div>
    </div>
  ),
};
