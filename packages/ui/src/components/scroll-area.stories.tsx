import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea, ScrollBar } from './scroll-area.js';
import { Separator } from './separator.js';

const meta: Meta<typeof ScrollArea> = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ScrollArea>;

const contributions = [
  { name: 'Thabo Nkosi', amount: 'R500', month: 'December 2024', status: 'Paid' },
  { name: 'Naledi Dlamini', amount: 'R500', month: 'December 2024', status: 'Paid' },
  { name: 'Sipho Khoza', amount: 'R500', month: 'December 2024', status: 'Pending' },
  { name: 'Precious Mokoena', amount: 'R500', month: 'December 2024', status: 'Overdue' },
  { name: 'Bongani Zulu', amount: 'R500', month: 'December 2024', status: 'Paid' },
  { name: 'Lerato Sithole', amount: 'R500', month: 'December 2024', status: 'Paid' },
  { name: 'Mpho Khumalo', amount: 'R500', month: 'December 2024', status: 'Pending' },
  { name: 'Zanele Nxumalo', amount: 'R500', month: 'December 2024', status: 'Paid' },
];

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-64 w-80 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">December 2024 contributions</h4>
        {contributions.map((c, i) => (
          <div key={c.name}>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.amount}</p>
              </div>
              <span className="text-xs text-muted-foreground">{c.status}</span>
            </div>
            {i < contributions.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea className="w-80 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {['Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025'].map((month) => (
          <div
            key={month}
            className="shrink-0 rounded-md border p-4 text-center w-32"
          >
            <p className="text-xs text-muted-foreground">{month}</p>
            <p className="text-lg font-bold mt-1">R500</p>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};
