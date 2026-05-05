import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox.js';
import { Label } from './label.js';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">I agree to the stokvel rules</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="paid" defaultChecked />
      <Label htmlFor="paid">Mark contribution as paid</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="locked" disabled />
      <Label htmlFor="locked" className="text-muted-foreground">Payout locked (past month)</Label>
    </div>
  ),
};

export const MemberChecklist: Story = {
  render: () => {
    const members = [
      { id: 'thabo', name: 'Thabo Nkosi', paid: true },
      { id: 'naledi', name: 'Naledi Dlamini', paid: true },
      { id: 'sipho', name: 'Sipho Khoza', paid: false },
      { id: 'precious', name: 'Precious Mokoena', paid: false },
    ];
    return (
      <div className="flex flex-col gap-3">
        {members.map((m) => (
          <div key={m.id} className="flex items-center space-x-2">
            <Checkbox id={m.id} defaultChecked={m.paid} />
            <Label htmlFor={m.id}>{m.name}</Label>
          </div>
        ))}
      </div>
    );
  },
};
