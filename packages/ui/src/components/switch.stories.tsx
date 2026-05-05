import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label.js';
import { Switch } from './switch.js';

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="notifications" />
      <Label htmlFor="notifications">Payment reminders</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="auto-pay" defaultChecked />
      <Label htmlFor="auto-pay">Auto-pay enabled</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="locked-switch" disabled />
      <Label htmlFor="locked-switch" className="text-muted-foreground">
        Feature locked (admin only)
      </Label>
    </div>
  ),
};

export const SettingsList: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="s-sms">SMS reminders</Label>
        <Switch id="s-sms" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="s-push">Push notifications</Label>
        <Switch id="s-push" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="s-offline">Offline mode</Label>
        <Switch id="s-offline" defaultChecked />
      </div>
    </div>
  ),
};
