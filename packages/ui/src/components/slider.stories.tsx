import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Label } from './label.js';
import { Slider } from './slider.js';

const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: { defaultValue: [500], min: 0, max: 2000, step: 50 },
};

export const ContributionAmount: Story = {
  render: () => {
    const [value, setValue] = useState([500]);
    return (
      <div className="w-80 space-y-4">
        <div className="flex justify-between">
          <Label>Contribution amount</Label>
          <span className="text-sm font-medium">R {value[0]}</span>
        </div>
        <Slider
          min={100}
          max={2000}
          step={50}
          value={value}
          onValueChange={setValue}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>R 100</span>
          <span>R 2 000</span>
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: { defaultValue: [500], min: 0, max: 2000, step: 50, disabled: true },
};
