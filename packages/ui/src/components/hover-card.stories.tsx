import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card.js';

const meta: Meta<typeof HoverCard> = {
  title: 'UI/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer underline decoration-dotted text-sm font-medium">
          Thabo Nkosi
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">Thabo Nkosi</h4>
          <p className="text-sm text-muted-foreground">Member since January 2023</p>
          <div className="flex items-center gap-4 pt-2 text-sm">
            <span>Payout slot: <strong>March</strong></span>
            <span>Status: <strong className="text-green-600">Paid</strong></span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const GroupInfo: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer underline decoration-dotted text-sm font-medium">
          Naledi's Savings Group
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">Naledi's Savings Group</h4>
          <p className="text-sm text-muted-foreground">8 members · Est. January 2023</p>
          <p className="text-sm text-muted-foreground">Monthly contribution: R500</p>
          <p className="text-sm text-muted-foreground">Current balance: R4 200</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};
