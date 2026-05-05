import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button.js';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer.js';
import { Input } from './input.js';
import { Label } from './label.js';

const meta: Meta<typeof Drawer> = {
  title: 'UI/Drawer',
  component: Drawer,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Make contribution</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Submit contribution</DrawerTitle>
          <DrawerDescription>
            Your monthly R500 contribution for December 2024.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (ZAR)</Label>
            <Input id="amount" defaultValue="500" type="number" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" placeholder="December contribution" />
          </div>
        </div>
        <DrawerFooter>
          <Button>Submit R500</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
