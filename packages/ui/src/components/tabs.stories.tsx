import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.js';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="contributions" className="w-80">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="contributions">Contributions</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="payout">Payout</TabsTrigger>
      </TabsList>
      <TabsContent value="contributions">
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Thabo Nkosi</span>
            <Badge>Paid</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Naledi Dlamini</span>
            <Badge variant="secondary">Pending</Badge>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="members">
        <div className="p-4 space-y-2 text-sm">
          <p>8 active members</p>
          <p className="text-muted-foreground">All members in good standing.</p>
        </div>
      </TabsContent>
      <TabsContent value="payout">
        <div className="p-4 space-y-2 text-sm">
          <p className="font-medium">Next payout</p>
          <p>Sipho Khoza — R4 000</p>
          <p className="text-muted-foreground">January 2025</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-72">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="p-4 text-sm">
          <p className="font-medium">Balance: R4 200</p>
          <p className="text-muted-foreground mt-1">6 of 8 members paid this month.</p>
        </div>
      </TabsContent>
      <TabsContent value="history">
        <div className="p-4 text-sm space-y-1">
          <p>December 2024 — R4 000</p>
          <p>November 2024 — R3 500</p>
          <p>October 2024 — R4 000</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
