import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label.js';
import { Input } from './input.js';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Enter your phone number' },
};

export const PhoneNumber: Story = {
  render: () => (
    <div className="grid gap-2 w-72">
      <Label htmlFor="phone">Phone number</Label>
      <Input id="phone" type="tel" placeholder="+27 82 123 4567" />
    </div>
  ),
};

export const PIN: Story = {
  render: () => (
    <div className="grid gap-2 w-48">
      <Label htmlFor="pin">PIN</Label>
      <Input id="pin" type="password" placeholder="4-digit PIN" maxLength={4} />
    </div>
  ),
};

export const Amount: Story = {
  render: () => (
    <div className="grid gap-2 w-48">
      <Label htmlFor="amount">Amount (ZAR)</Label>
      <Input id="amount" type="number" placeholder="500" min={0} step={50} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { placeholder: 'Locked field', disabled: true },
};

export const WithError: Story = {
  render: () => (
    <div className="grid gap-2 w-72">
      <Label htmlFor="err-phone">Phone number</Label>
      <Input
        id="err-phone"
        type="tel"
        placeholder="+27 82 123 4567"
        className="border-destructive focus-visible:ring-destructive"
        defaultValue="not-a-number"
        aria-invalid="true"
      />
      <p className="text-sm text-destructive">Enter a valid SA number e.g. +27821234567</p>
    </div>
  ),
};
