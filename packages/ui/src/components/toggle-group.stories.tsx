import type { Meta, StoryObj } from '@storybook/react';
import { ToggleGroup, ToggleGroupItem } from './toggle-group.js';

const meta: Meta<typeof ToggleGroup> = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'radio', options: ['single', 'multiple'] },
    variant: { control: 'select', options: ['default', 'outline'] },
  },
};
export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Single: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="monthly">
      <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
      <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
      <ToggleGroupItem value="quarterly">Quarterly</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={['paid']}>
      <ToggleGroupItem value="paid">Paid</ToggleGroupItem>
      <ToggleGroupItem value="pending">Pending</ToggleGroupItem>
      <ToggleGroupItem value="overdue">Overdue</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Outline: Story = {
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="all">
      <ToggleGroupItem value="all">All</ToggleGroupItem>
      <ToggleGroupItem value="paid">Paid</ToggleGroupItem>
      <ToggleGroupItem value="overdue">Overdue</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const MonthSelector: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="dec">
      <ToggleGroupItem value="oct">Oct</ToggleGroupItem>
      <ToggleGroupItem value="nov">Nov</ToggleGroupItem>
      <ToggleGroupItem value="dec">Dec</ToggleGroupItem>
      <ToggleGroupItem value="jan">Jan</ToggleGroupItem>
    </ToggleGroup>
  ),
};
