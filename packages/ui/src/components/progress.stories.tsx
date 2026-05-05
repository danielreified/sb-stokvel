import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress.js';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
};
export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 60 },
};

export const ContributionsReceived: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>December contributions</span>
          <span className="text-muted-foreground">6 / 8 members</span>
        </div>
        <Progress value={75} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Monthly target</span>
          <span className="text-muted-foreground">R3 000 / R4 000</span>
        </div>
        <Progress value={75} />
      </div>
    </div>
  ),
};

export const Empty: Story = { args: { value: 0 } };
export const Half: Story = { args: { value: 50 } };
export const Full: Story = { args: { value: 100 } };
