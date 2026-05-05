import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label.js';
import { Textarea } from './textarea.js';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { placeholder: 'Enter a note...' },
};

export const ContributionNote: Story = {
  render: () => (
    <div className="grid gap-2 w-80">
      <Label htmlFor="note">Note (optional)</Label>
      <Textarea
        id="note"
        placeholder="e.g. December contribution including penalty fee"
        rows={3}
      />
    </div>
  ),
};

export const StokvelRules: Story = {
  render: () => (
    <div className="grid gap-2 w-80">
      <Label htmlFor="rules">Group rules</Label>
      <Textarea
        id="rules"
        defaultValue="1. Monthly contribution: R500 due by the first Friday.&#10;2. Late penalty: R50 per week.&#10;3. Payout order by annual draw."
        rows={5}
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Locked',
    disabled: true,
    defaultValue: 'Locked field — admin access required.',
  },
};
