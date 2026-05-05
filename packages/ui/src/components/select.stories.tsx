import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label.js';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select.js';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Select month" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="2024-10">October 2024</SelectItem>
        <SelectItem value="2024-11">November 2024</SelectItem>
        <SelectItem value="2024-12">December 2024</SelectItem>
        <SelectItem value="2025-01">January 2025</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <div className="grid gap-2 w-64">
      <Label htmlFor="member-select">Filter by member</Label>
      <Select>
        <SelectTrigger id="member-select">
          <SelectValue placeholder="All members" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Paid</SelectLabel>
            <SelectItem value="thabo">Thabo Nkosi</SelectItem>
            <SelectItem value="naledi">Naledi Dlamini</SelectItem>
            <SelectItem value="bongani">Bongani Zulu</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Pending / Overdue</SelectLabel>
            <SelectItem value="sipho">Sipho Khoza</SelectItem>
            <SelectItem value="precious">Precious Mokoena</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const ContributionAmount: Story = {
  render: () => (
    <div className="grid gap-2 w-40">
      <Label htmlFor="amount-select">Amount</Label>
      <Select defaultValue="500">
        <SelectTrigger id="amount-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="250">R 250</SelectItem>
          <SelectItem value="500">R 500</SelectItem>
          <SelectItem value="1000">R 1 000</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
