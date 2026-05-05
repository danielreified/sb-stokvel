import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox.js';
import { Input } from './input.js';
import { Label } from './label.js';

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { children: 'Phone number' },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid gap-2 w-72">
      <Label htmlFor="phone-label">Phone number</Label>
      <Input id="phone-label" type="tel" placeholder="+27 82 123 4567" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="agree-label" />
      <Label htmlFor="agree-label">I agree to the stokvel rules</Label>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="grid gap-2 w-72">
      <Label htmlFor="required-phone">
        Phone number <span className="text-destructive">*</span>
      </Label>
      <Input id="required-phone" type="tel" placeholder="+27 82 123 4567" required />
    </div>
  ),
};
