import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button.js';
import { Input } from './input.js';
import { Label } from './label.js';
import { Popover, PopoverContent, PopoverTrigger } from './popover.js';

const meta: Meta<typeof Popover> = {
  title: 'UI/Popover',
  component: Popover,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Filter contributions</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Filter options</h4>
          <div className="grid gap-2">
            <Label htmlFor="pop-month">Month</Label>
            <Input id="pop-month" type="month" defaultValue="2024-12" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pop-member">Member</Label>
            <Input id="pop-member" placeholder="e.g. Thabo" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">Reset</Button>
            <Button size="sm">Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const InfoPopover: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">What is a stokvel?</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="text-sm text-muted-foreground">
          A stokvel is a South African community savings club where members regularly contribute a fixed amount to a shared pool. Each member receives the total pot on a rotating basis.
        </p>
      </PopoverContent>
    </Popover>
  ),
};
