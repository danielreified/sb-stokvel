import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from './alert.js';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Contribution received</AlertTitle>
      <AlertDescription>
        Your R500 contribution for November has been recorded successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>Payment overdue</AlertTitle>
      <AlertDescription>
        Naledi's contribution for October is 5 days overdue. A R50 late fee has been applied.
      </AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Alert>
        <AlertTitle>Default alert</AlertTitle>
        <AlertDescription>Your stokvel balance is R4 200.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Destructive alert</AlertTitle>
        <AlertDescription>Failed to process contribution. Please try again.</AlertDescription>
      </Alert>
    </div>
  ),
};
