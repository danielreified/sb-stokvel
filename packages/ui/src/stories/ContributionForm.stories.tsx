import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/button.js';
import { Input } from '../components/input.js';
import { Label } from '../components/label.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/select.js';

const meta: Meta = {
  title: 'Layout/ContributionForm',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <button
          type="button"
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1 className="text-xl font-semibold">Make a contribution</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ubuntu Stokvel · May 2025</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label>Member</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select member" />
            </SelectTrigger>
            <SelectContent>
              {[
                'Nomsa Dlamini',
                'Thabo Nkosi',
                'Naledi Mokoena',
                'Sipho Khoza',
                'Precious Zulu',
              ].map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Amount (R)</Label>
          <Input type="number" placeholder="500" min="1" />
          <p className="text-xs text-muted-foreground">Minimum contribution: R 500,00</p>
        </div>

        <div className="space-y-1.5">
          <Label>Month</Label>
          <Select defaultValue="2025-05">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-03">March 2025</SelectItem>
              <SelectItem value="2025-04">April 2025</SelectItem>
              <SelectItem value="2025-05">May 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Offline notice</p>
          <p>
            Contributions require an active connection. This form will be disabled when offline.
          </p>
        </div>

        <Button className="w-full" size="lg">
          Submit contribution
        </Button>
      </div>
    </div>
  ),
};

export const Offline: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <button
          type="button"
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1 className="text-xl font-semibold">Make a contribution</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ubuntu Stokvel · May 2025</p>
      </div>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 mb-5 flex items-start gap-3">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-destructive mt-0.5 shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p className="text-sm font-medium text-destructive">You're offline</p>
          <p className="text-xs text-destructive/80 mt-0.5">
            You need a connection to send money. Connect to a network and try again.
          </p>
        </div>
      </div>

      <div className="space-y-5 opacity-50 pointer-events-none">
        <div className="space-y-1.5">
          <Label>Member</Label>
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Select member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nomsa">Nomsa Dlamini</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Amount (R)</Label>
          <Input type="number" placeholder="500" disabled />
        </div>
        <Button className="w-full" size="lg" disabled>
          Submit contribution
        </Button>
      </div>
    </div>
  ),
};
