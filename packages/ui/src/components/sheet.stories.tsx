import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button.js';
import { Input } from './input.js';
import { Label } from './label.js';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet.js';

const meta: Meta<typeof Sheet> = {
  title: 'UI/Sheet',
  component: Sheet,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open member details</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Thabo Nkosi</SheetTitle>
          <SheetDescription>
            Member since January 2023. Payout slot: March 2025.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="sheet-phone">Phone</Label>
            <Input id="sheet-phone" defaultValue="+27 82 000 0000" readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sheet-status">Status</Label>
            <Input id="sheet-status" defaultValue="Paid" readOnly />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button>Send reminder</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const FromLeft: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open navigation</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Seyva</SheetTitle>
          <SheetDescription>Naledi's Savings Group</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-4">
          <Button variant="ghost" className="justify-start">Dashboard</Button>
          <Button variant="ghost" className="justify-start">Members</Button>
          <Button variant="ghost" className="justify-start">Contributions</Button>
          <Button variant="ghost" className="justify-start">Payout schedule</Button>
        </nav>
      </SheetContent>
    </Sheet>
  ),
};
