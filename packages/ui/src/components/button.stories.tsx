import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button.js';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { children: 'Sign in' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Sign out' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Cancel' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Later' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Dismiss' } };
export const Link: Story = { args: { variant: 'link', children: 'View details' } };
export const Small: Story = { args: { size: 'sm', children: 'Small' } };
export const Large: Story = { args: { size: 'lg', children: 'Submit contribution' } };
export const Disabled: Story = { args: { children: 'Disabled', disabled: true } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};
