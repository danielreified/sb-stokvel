import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/button.js';
import { Input } from '../components/input.js';
import { Label } from '../components/label.js';

const meta: Meta = {
  title: 'Layout/LoginPage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-primary shadow-lg">
          S
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-white/70">Sign in to your stokvel</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-1.5">
          <Label className="text-white/80">Mobile number</Label>
          <Input
            type="tel"
            defaultValue="+27"
            className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/50"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/80">PIN</Label>
          <Input
            type="password"
            placeholder="····"
            className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/50"
          />
        </div>
        <Button className="w-full bg-white text-primary hover:bg-white/90">Sign in</Button>

        <div className="pt-2">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-white/40">
            or
          </p>
          <button
            type="button"
            className="flex w-full items-center gap-4 rounded-2xl bg-white/10 p-4 text-left backdrop-blur-sm transition-all hover:bg-white/20"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <span className="text-lg font-bold text-primary">S</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Install app</p>
              <p className="truncate text-xs text-white/60">
                Get quick access to your stokvel, even offline
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  ),
};
