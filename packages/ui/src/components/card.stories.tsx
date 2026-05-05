import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge.js';
import { Button } from './button.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card.js';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Naledi's Savings Group</CardTitle>
        <CardDescription>8 members · Est. January 2023</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">R 4 200</p>
        <p className="text-sm text-muted-foreground">Total balance this month</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">View members</Button>
        <Button>Contribute</Button>
      </CardFooter>
    </Card>
  ),
};

export const ContributionCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Thabo Nkosi</CardTitle>
          <Badge>Paid</Badge>
        </div>
        <CardDescription>December 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold">R 500</p>
      </CardContent>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>Next payout</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-primary">R 4 000</p>
        <p className="text-sm text-muted-foreground mt-1">Sipho Khoza · Jan 2025</p>
      </CardContent>
    </Card>
  ),
};
