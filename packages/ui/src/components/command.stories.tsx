import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './button.js';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './command.js';

const meta: Meta<typeof Command> = {
  title: 'UI/Command',
  component: Command,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-80">
      <CommandInput placeholder="Search members or contributions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Members">
          <CommandItem>Thabo Nkosi</CommandItem>
          <CommandItem>Naledi Dlamini</CommandItem>
          <CommandItem>Sipho Khoza</CommandItem>
          <CommandItem>Precious Mokoena</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem>Submit contribution</CommandItem>
          <CommandItem>View payout schedule</CommandItem>
          <CommandItem>Export statement</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const WithDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open command palette</Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search stokvel..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Members">
              <CommandItem onSelect={() => setOpen(false)}>Thabo Nkosi</CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>Naledi Dlamini</CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>Sipho Khoza</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => setOpen(false)}>Submit contribution</CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>View balance</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    );
  },
};
