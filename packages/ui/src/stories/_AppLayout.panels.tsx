import { useState } from 'react';
import { Badge } from '../components/badge.js';
import { Button } from '../components/button.js';
import { ScrollArea } from '../components/scroll-area.js';
import { Separator } from '../components/separator.js';

export const members = [
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

export const contributions = [
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

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('');

export function DashboardPanel() {
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
                  {initialsOf(c.member)}
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

export function MembersPanel() {
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
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
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

export function ContributionsPanel() {
  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Contributions</h2>
          <p className="text-sm text-muted-foreground">May 2025 · 6 of 8 paid</p>
        </div>
        <Button>+ Make contribution</Button>
      </div>
      <div className="overflow-hidden rounded-lg border">
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
                {initialsOf(c.member)}
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

export function ProfilePanel() {
  return (
    <div className="space-y-5 p-6">
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
      <div className="divide-y rounded-lg border bg-card">
        {['Account settings', 'Notifications', 'Privacy & security', 'Help & support'].map(
          (item) => (
            <button
              key={item}
              type="button"
              className="flex w-full items-center justify-between p-4 text-sm transition-colors hover:bg-muted/50"
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
      <Button
        variant="outline"
        className="w-full border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        Sign out
      </Button>
    </div>
  );
}
