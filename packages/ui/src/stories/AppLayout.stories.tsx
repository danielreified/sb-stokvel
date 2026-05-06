import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Badge } from '../components/badge.js';
import { ScrollArea } from '../components/scroll-area.js';
import { Separator } from '../components/separator.js';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../components/sidebar.js';

const meta: Meta = {
  title: 'Layout/AppLayout',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

type NavItem = 'dashboard' | 'members' | 'contributions' | 'profile';

const members = [
  {
    id: '1',
    name: 'Nomsa Dlamini',
    initials: 'ND',
    phone: '+27 82 100 0001',
    status: 'Paid',
    payout: 'Jan 2025',
  },
  {
    id: '2',
    name: 'Thabo Nkosi',
    initials: 'TN',
    phone: '+27 82 100 0002',
    status: 'Paid',
    payout: 'Feb 2025',
  },
  {
    id: '3',
    name: 'Naledi Mokoena',
    initials: 'NM',
    phone: '+27 82 100 0003',
    status: 'Pending',
    payout: 'Mar 2025',
  },
  {
    id: '4',
    name: 'Sipho Khoza',
    initials: 'SK',
    phone: '+27 82 100 0004',
    status: 'Paid',
    payout: 'Apr 2025',
  },
  {
    id: '5',
    name: 'Precious Zulu',
    initials: 'PZ',
    phone: '+27 82 100 0005',
    status: 'Overdue',
    payout: 'May 2025',
  },
  {
    id: '6',
    name: 'Bongani Sithole',
    initials: 'BS',
    phone: '+27 82 100 0006',
    status: 'Paid',
    payout: 'Jun 2025',
  },
  {
    id: '7',
    name: 'Lindiwe Mthembu',
    initials: 'LM',
    phone: '+27 82 100 0007',
    status: 'Paid',
    payout: 'Jul 2025',
  },
  {
    id: '8',
    name: 'Mandla Cele',
    initials: 'MC',
    phone: '+27 82 100 0008',
    status: 'Pending',
    payout: 'Aug 2025',
  },
];

const contributions = [
  { member: 'Nomsa Dlamini', month: 'May 2025', amount: 'R 500,00', status: 'Paid', date: '2 May' },
  { member: 'Thabo Nkosi', month: 'May 2025', amount: 'R 500,00', status: 'Paid', date: '1 May' },
  { member: 'Sipho Khoza', month: 'May 2025', amount: 'R 500,00', status: 'Paid', date: '3 May' },
  { member: 'Naledi Mokoena', month: 'May 2025', amount: 'R 500,00', status: 'Pending', date: '—' },
  { member: 'Precious Zulu', month: 'May 2025', amount: 'R 500,00', status: 'Overdue', date: '—' },
  {
    member: 'Bongani Sithole',
    month: 'Apr 2025',
    amount: 'R 500,00',
    status: 'Paid',
    date: '4 Apr',
  },
  {
    member: 'Lindiwe Mthembu',
    month: 'Apr 2025',
    amount: 'R 500,00',
    status: 'Paid',
    date: '2 Apr',
  },
  { member: 'Mandla Cele', month: 'Apr 2025', amount: 'R 500,00', status: 'Pending', date: '—' },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  Paid: 'default',
  Pending: 'secondary',
  Overdue: 'destructive',
};

const navItems: { id: NavItem; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg
        width="18"
        height="18"
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
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'contributions',
    label: 'Contributions',
    icon: (
      <svg
        width="18"
        height="18"
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
        width="18"
        height="18"
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
];

function DashboardPanel() {
  return (
    <div className="space-y-5 p-6">
      <div>
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Ubuntu Stokvel · 8 members</p>
      </div>
      <div className="rounded-xl bg-primary p-6 text-white">
        <p className="text-xs font-medium uppercase tracking-widest opacity-70">Total balance</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">R 11 500,00</p>
        <p className="mt-1.5 text-xs opacity-60">Reconciled 5 days ago</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Monthly target', value: 'R 500,00' },
          { label: 'Paid this month', value: '6 / 8' },
          { label: 'Next payout', value: 'Naledi M.' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-semibold">{s.value}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Recent activity</p>
        <div className="space-y-2">
          {contributions.slice(0, 5).map((c) => (
            <div
              key={c.member + c.month}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {c.member
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.member}</p>
                  <p className="text-xs text-muted-foreground">{c.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{c.amount}</span>
                <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MembersPanel() {
  const [selected, setSelected] = useState(members[0]);
  return (
    <div className="flex h-full">
      <div className="w-60 shrink-0 border-r">
        <div className="border-b px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Members
          </p>
        </div>
        <ScrollArea className="h-[calc(100%-2.75rem)]">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${selected.id === m.id ? 'bg-muted' : ''}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {m.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.status}</p>
              </div>
            </button>
          ))}
        </ScrollArea>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {selected.initials}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{selected.name}</h2>
            <p className="text-sm text-muted-foreground">{selected.phone}</p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Contribution', value: 'R 500,00' },
            { label: 'Payout month', value: selected.payout },
            { label: 'Status', value: selected.status },
            { label: 'Member since', value: 'January 2023' },
          ].map((r) => (
            <div key={r.label} className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">{r.label}</p>
              <p className="mt-1 font-semibold">{r.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContributionsPanel() {
  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Contributions</h2>
          <p className="text-sm text-muted-foreground">May 2025 · 6 of 8 paid</p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          + Make contribution
        </button>
      </div>
      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Member</span>
          <span>Month</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {contributions.map((c, i) => (
          <div
            key={`${c.member}-${c.month}`}
            className={`grid grid-cols-4 items-center px-4 py-3 ${i < contributions.length - 1 ? 'border-b' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {c.member
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <span className="text-sm font-medium">{c.member}</span>
            </div>
            <span className="text-sm text-muted-foreground">{c.month}</span>
            <span className="text-sm font-semibold">{c.amount}</span>
            <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePanel() {
  return (
    <div className="p-6 space-y-5 max-w-md">
      <h2 className="text-xl font-semibold">Profile</h2>
      <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
          ND
        </div>
        <div>
          <p className="text-lg font-semibold">Nomsa Dlamini</p>
          <p className="text-sm text-muted-foreground">+27 82 100 0001</p>
        </div>
      </div>
      <div className="rounded-lg border bg-card divide-y">
        {['Account settings', 'Notifications', 'Privacy & security', 'Help & support'].map(
          (item) => (
            <button
              key={item}
              type="button"
              className="flex w-full items-center justify-between p-4 text-sm hover:bg-muted/50 transition-colors"
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
  );
}

function AppWindow() {
  const [active, setActive] = useState<NavItem>('dashboard');

  return (
    <SidebarProvider>
      <div className="flex h-full w-full overflow-hidden rounded-2xl border bg-background shadow-2xl">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex h-10 items-center gap-2 px-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                S
              </div>
              <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">
                Seyva
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={active === item.id}
                        onClick={() => setActive(item.id)}
                        tooltip={item.label}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 group-data-[collapsible=icon]:justify-center">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                ND
              </div>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-xs font-medium">Nomsa Dlamini</p>
                <p className="truncate text-[10px] text-muted-foreground">+27 82 100 0001</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-medium capitalize text-muted-foreground">
              Ubuntu Stokvel
            </span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-semibold capitalize">{active}</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </header>

          <div className={`flex-1 overflow-y-auto ${active === 'members' ? '' : ''}`}>
            {active === 'dashboard' && <DashboardPanel />}
            {active === 'members' && <MembersPanel />}
            {active === 'contributions' && <ContributionsPanel />}
            {active === 'profile' && <ProfilePanel />}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export const Default: Story = {
  render: () => (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0f1e] p-10">
      {/* Background vector decoration */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Grid dots */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.06)" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,51,160,0.3)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#fade)" />

        {/* Decorative circles */}
        <circle
          cx="10%"
          cy="20%"
          r="180"
          fill="none"
          stroke="rgba(0,51,160,0.25)"
          strokeWidth="1"
        />
        <circle
          cx="10%"
          cy="20%"
          r="280"
          fill="none"
          stroke="rgba(0,51,160,0.12)"
          strokeWidth="1"
        />
        <circle cx="90%" cy="80%" r="200" fill="none" stroke="rgba(0,51,160,0.2)" strokeWidth="1" />
        <circle
          cx="90%"
          cy="80%"
          r="320"
          fill="none"
          stroke="rgba(0,51,160,0.08)"
          strokeWidth="1"
        />

        {/* Corner accent lines */}
        <line x1="0" y1="0" x2="200" y2="200" stroke="rgba(0,51,160,0.15)" strokeWidth="1" />
        <line
          x1="100%"
          y1="100%"
          x2="calc(100% - 200px)"
          y2="calc(100% - 200px)"
          stroke="rgba(0,51,160,0.15)"
          strokeWidth="1"
        />
      </svg>

      {/* Glow behind the app */}
      <div className="absolute h-[600px] w-[900px] rounded-3xl bg-primary/20 blur-3xl" />

      {/* The app window */}
      <div className="relative z-10 h-[640px] w-[1024px]">
        <AppWindow />
      </div>
    </div>
  ),
};
