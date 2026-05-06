import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from '../components/logo.js';

const meta: Meta<typeof Logo> = {
  title: 'UI/Logo',
  component: Logo,
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['mark', 'full'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Logo>;

export const Mark: Story = {
  args: { variant: 'mark', className: 'h-16 w-auto' },
};

export const Full: Story = {
  args: { variant: 'full', className: 'h-12 w-auto' },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="flex items-end gap-6">
        <Logo variant="mark" className="h-6 w-auto" />
        <Logo variant="mark" className="h-10 w-auto" />
        <Logo variant="mark" className="h-16 w-auto" />
        <Logo variant="mark" className="h-24 w-auto" />
      </div>
      <div className="space-y-3">
        <Logo variant="full" className="h-6 w-auto" />
        <Logo variant="full" className="h-10 w-auto" />
        <Logo variant="full" className="h-14 w-auto" />
      </div>
    </div>
  ),
};

export const OnDark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#001f6e] p-10">
      <div className="space-y-6">
        <Logo variant="full" className="h-14 w-auto" />
        <Logo variant="mark" className="h-20 w-auto" />
      </div>
    </div>
  ),
};

export const OnBrand: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#2B52CC] p-10">
      <div className="space-y-6">
        <Logo variant="full" className="h-14 w-auto" />
        <Logo variant="mark" className="h-20 w-auto" />
      </div>
    </div>
  ),
};
