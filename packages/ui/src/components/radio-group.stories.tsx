import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label.js';
import { RadioGroup, RadioGroupItem } from './radio-group.js';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="r500">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="r250" id="r250" />
        <Label htmlFor="r250">R250</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="r500" id="r500" />
        <Label htmlFor="r500">R500</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="r1000" id="r1000" />
        <Label htmlFor="r1000">R1 000</Label>
      </div>
    </RadioGroup>
  ),
};

export const ContributionFrequency: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-sm font-medium">Contribution frequency</p>
      <RadioGroup defaultValue="monthly">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="weekly" id="weekly" />
          <Label htmlFor="weekly">Weekly</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="monthly" id="monthly" />
          <Label htmlFor="monthly">Monthly</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="quarterly" id="quarterly" />
          <Label htmlFor="quarterly">Quarterly</Label>
        </div>
      </RadioGroup>
    </div>
  ),
};

export const PayoutMethod: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-sm font-medium">Payout method</p>
      <RadioGroup defaultValue="bank">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bank" id="bank" />
          <Label htmlFor="bank">Bank transfer</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cash" id="cash" />
          <Label htmlFor="cash">Cash at meeting</Label>
        </div>
      </RadioGroup>
    </div>
  ),
};
