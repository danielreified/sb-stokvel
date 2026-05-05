import type { Meta, StoryObj } from '@storybook/react';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu.js';

const meta: Meta<typeof ContextMenu> = {
  title: 'UI/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex h-32 w-80 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground select-none">
          Right-click here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuLabel>Thabo Nkosi</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>View profile</ContextMenuItem>
        <ContextMenuItem>View contributions</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>Mark as paid</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Send reminder</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>via SMS</ContextMenuItem>
            <ContextMenuItem>via WhatsApp</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive">Remove member</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
