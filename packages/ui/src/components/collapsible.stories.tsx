import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './button.js';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible.js';

const meta: Meta<typeof Collapsible> = {
  title: 'UI/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-80 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Recent contributions</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? 'Hide' : 'Show all'}
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-3 text-sm">
          Thabo Nkosi · R500 · Dec 2024
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 text-sm">
            Naledi Dlamini · R500 · Dec 2024
          </div>
          <div className="rounded-md border px-4 py-3 text-sm">
            Sipho Khoza · R500 · Dec 2024
          </div>
          <div className="rounded-md border px-4 py-3 text-sm">
            Precious Mokoena · R500 · Dec 2024
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};
