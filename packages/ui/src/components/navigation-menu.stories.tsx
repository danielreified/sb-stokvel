import type { Meta, StoryObj } from '@storybook/react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './navigation-menu.js';

const meta: Meta<typeof NavigationMenu> = {
  title: 'UI/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Savings group</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 w-64">
              <li>
                <NavigationMenuLink href="/dashboard" className="block p-2 rounded-md hover:bg-accent">
                  <div className="font-medium text-sm">Dashboard</div>
                  <div className="text-xs text-muted-foreground">Overview of your group</div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/contributions" className="block p-2 rounded-md hover:bg-accent">
                  <div className="font-medium text-sm">Contributions</div>
                  <div className="text-xs text-muted-foreground">Monthly payment history</div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/payout" className="block p-2 rounded-md hover:bg-accent">
                  <div className="font-medium text-sm">Payout schedule</div>
                  <div className="text-xs text-muted-foreground">Who receives next</div>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Members</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 w-48">
              <li>
                <NavigationMenuLink href="/members" className="block p-2 rounded-md hover:bg-accent text-sm">
                  View all members
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/members/add" className="block p-2 rounded-md hover:bg-accent text-sm">
                  Add member
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/profile" className={navigationMenuTriggerStyle()}>
            Profile
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};
