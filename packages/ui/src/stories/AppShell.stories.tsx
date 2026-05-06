import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Layout/AppShell',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj;

function BottomNav({ active }: { active: 'dashboard' | 'members' | 'contributions' | 'profile' }) {
  const items = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'members',
      label: 'Members',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'contributions',
      label: 'Contributions',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex h-16 items-center border-t bg-background">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export const Dashboard: Story = {
  render: () => (
    <div className="relative min-h-screen bg-background">
      <div className="pb-16 p-4 space-y-4">
        <h1 className="text-lg font-semibold text-foreground">Ubuntu Stokvel</h1>

        <div className="rounded-xl bg-primary p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-widest opacity-70">Total balance</p>
          <p className="mt-1 text-3xl font-bold">R 11 500,00</p>
          <p className="mt-1 text-xs opacity-60">Reconciled 5 days ago</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Monthly target</p>
            <p className="mt-1 font-semibold">R 500,00</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Members</p>
            <p className="mt-1 font-semibold">8 members</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Rules
          </p>
          <p className="text-sm text-foreground">
            Monthly contribution of R500. Payout rotates monthly. Missed contribution = penalty.
          </p>
        </div>
      </div>
      <BottomNav active="dashboard" />
    </div>
  ),
};

export const Members: Story = {
  render: () => {
    const members = [
      { name: 'Nomsa Dlamini', phone: '+27 82 100 0001', status: 'Paid' },
      { name: 'Thabo Nkosi', phone: '+27 82 100 0002', status: 'Paid' },
      { name: 'Naledi Mokoena', phone: '+27 82 100 0003', status: 'Pending' },
      { name: 'Sipho Khoza', phone: '+27 82 100 0004', status: 'Paid' },
      { name: 'Precious Zulu', phone: '+27 82 100 0005', status: 'Overdue' },
      { name: 'Bongani Sithole', phone: '+27 82 100 0006', status: 'Paid' },
      { name: 'Lindiwe Mthembu', phone: '+27 82 100 0007', status: 'Paid' },
      { name: 'Mandla Cele', phone: '+27 82 100 0008', status: 'Pending' },
    ];
    const statusColour: Record<string, string> = {
      Paid: 'text-green-600 bg-green-50',
      Pending: 'text-yellow-700 bg-yellow-50',
      Overdue: 'text-destructive bg-red-50',
    };
    return (
      <div className="relative min-h-screen bg-background">
        <div className="pb-16 p-4 space-y-3">
          <h1 className="text-lg font-semibold">Members</h1>
          {members.map((m) => (
            <div key={m.name} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {m.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.phone}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColour[m.status]}`}
              >
                {m.status}
              </span>
            </div>
          ))}
        </div>
        <BottomNav active="members" />
      </div>
    );
  },
};

export const Contributions: Story = {
  render: () => {
    const contributions = [
      { member: 'Nomsa Dlamini', month: 'May 2025', amount: 'R 500,00', status: 'Paid' },
      { member: 'Thabo Nkosi', month: 'May 2025', amount: 'R 500,00', status: 'Paid' },
      { member: 'Naledi Mokoena', month: 'May 2025', amount: 'R 500,00', status: 'Pending' },
      { member: 'Sipho Khoza', month: 'May 2025', amount: 'R 500,00', status: 'Paid' },
      { member: 'Precious Zulu', month: 'May 2025', amount: 'R 500,00', status: 'Overdue' },
    ];
    const statusColour: Record<string, string> = {
      Paid: 'text-green-600',
      Pending: 'text-yellow-700',
      Overdue: 'text-destructive',
    };
    return (
      <div className="relative min-h-screen bg-background">
        <div className="pb-16 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Contributions</h1>
            <button
              type="button"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
            >
              + Make contribution
            </button>
          </div>
          {contributions.map((c) => (
            <div
              key={c.member}
              className="flex items-center justify-between rounded-lg border bg-card p-3"
            >
              <div>
                <p className="text-sm font-medium">{c.member}</p>
                <p className="text-xs text-muted-foreground">{c.month}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{c.amount}</p>
                <p className={`text-xs font-medium ${statusColour[c.status]}`}>{c.status}</p>
              </div>
            </div>
          ))}
        </div>
        <BottomNav active="contributions" />
      </div>
    );
  },
};

export const Profile: Story = {
  render: () => (
    <div className="relative min-h-screen bg-background">
      <div className="pb-16 p-4 space-y-4">
        <h1 className="text-lg font-semibold">Profile</h1>
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            ND
          </div>
          <div className="text-center">
            <p className="font-semibold">Nomsa Dlamini</p>
            <p className="text-sm text-muted-foreground">+27 82 100 0001</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card divide-y">
          {['Account settings', 'Notifications', 'Privacy & security', 'Help & support'].map(
            (item) => (
              <button
                key={item}
                type="button"
                className="flex w-full items-center justify-between p-4 text-sm text-left hover:bg-muted/50 transition-colors"
              >
                {item}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          className="w-full rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive"
        >
          Sign out
        </button>
      </div>
      <BottomNav active="profile" />
    </div>
  ),
};
