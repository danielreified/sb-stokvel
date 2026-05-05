import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button.js';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.js';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Contribute</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Submit your monthly R500 contribution</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const OnIcon: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Offline mode active">
          <span className="text-base">📵</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>You are offline — contributions disabled</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const MultipleTooltips: Story = {
  render: () => (
    <div className="flex gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm">Paid</Button>
        </TooltipTrigger>
        <TooltipContent>Mark contribution as paid</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="outline">Remind</Button>
        </TooltipTrigger>
        <TooltipContent>Send SMS reminder to member</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="ghost">Export</Button>
        </TooltipTrigger>
        <TooltipContent>Export statement as PDF</TooltipContent>
      </Tooltip>
    </div>
  ),
};
