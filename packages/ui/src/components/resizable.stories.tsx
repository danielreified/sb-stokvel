import type { Meta, StoryObj } from '@storybook/react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable.js';

const meta: Meta<typeof ResizablePanelGroup> = {
  title: 'UI/Resizable',
  component: ResizablePanelGroup,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ResizablePanelGroup>;

export const Default: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="h-48 w-full max-w-2xl rounded-lg border">
      <ResizablePanel defaultSize={30}>
        <div className="flex h-full flex-col p-4">
          <h3 className="text-sm font-medium mb-2">Members</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Thabo Nkosi</li>
            <li>Naledi Dlamini</li>
            <li>Sipho Khoza</li>
          </ul>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <div className="flex h-full flex-col p-4">
          <h3 className="text-sm font-medium mb-2">Contributions — December 2024</h3>
          <p className="text-sm text-muted-foreground">Select a member to view details.</p>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const ThreePanels: Story = {
  render: () => (
    <ResizablePanelGroup direction="horizontal" className="h-48 w-full max-w-2xl rounded-lg border">
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-4 text-sm font-medium">
          Groups
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={40}>
        <div className="flex h-full items-center justify-center p-4 text-sm font-medium">
          Members
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={35}>
        <div className="flex h-full items-center justify-center p-4 text-sm font-medium">
          Contributions
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup direction="vertical" className="h-72 w-80 rounded-lg border">
      <ResizablePanel defaultSize={40}>
        <div className="flex h-full flex-col p-4">
          <h3 className="text-sm font-medium">Balance summary</h3>
          <p className="text-2xl font-bold mt-2">R 4 200</p>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60}>
        <div className="flex h-full flex-col p-4">
          <h3 className="text-sm font-medium mb-2">Recent activity</h3>
          <p className="text-sm text-muted-foreground">Thabo Nkosi · R500 · 1 Dec</p>
          <p className="text-sm text-muted-foreground">Naledi Dlamini · R500 · 1 Dec</p>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
