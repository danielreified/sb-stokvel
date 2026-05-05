import type { Meta, StoryObj } from '@storybook/react';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './menubar.js';

const meta: Meta<typeof Menubar> = {
  title: 'UI/Menubar',
  component: Menubar,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Menubar>;

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Stokvel</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Dashboard</MenubarItem>
          <MenubarItem>My contributions</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Payout schedule</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Sign out <MenubarShortcut>⇧Q</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Members</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>8 members</MenubarLabel>
          <MenubarSeparator />
          <MenubarItem>View all</MenubarItem>
          <MenubarItem>Add member</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Filter by status</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarRadioGroup value="all">
                <MenubarRadioItem value="all">All</MenubarRadioItem>
                <MenubarRadioItem value="paid">Paid</MenubarRadioItem>
                <MenubarRadioItem value="pending">Pending</MenubarRadioItem>
                <MenubarRadioItem value="overdue">Overdue</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>Show amounts</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show last payment date</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem>
            Refresh <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};
