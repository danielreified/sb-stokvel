import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './toggle.js';

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline'] },
    size: { control: 'select', options: ['default', 'sm', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: { children: 'Paid only', 'aria-label': 'Toggle paid only' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Overdue only', 'aria-label': 'Toggle overdue only' },
};

export const Pressed: Story = {
  args: { children: 'Active filter', defaultPressed: true, 'aria-label': 'Toggle active filter' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Toggle aria-label="Default">Default</Toggle>
      <Toggle variant="outline" aria-label="Outline">Outline</Toggle>
      <Toggle defaultPressed aria-label="Pressed">Pressed</Toggle>
      <Toggle disabled aria-label="Disabled">Disabled</Toggle>
    </div>
  ),
};

export const FilterBar: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle aria-label="All" defaultPressed>All</Toggle>
      <Toggle variant="outline" aria-label="Paid">Paid</Toggle>
      <Toggle variant="outline" aria-label="Pending">Pending</Toggle>
      <Toggle variant="outline" aria-label="Overdue">Overdue</Toggle>
    </div>
  ),
};
