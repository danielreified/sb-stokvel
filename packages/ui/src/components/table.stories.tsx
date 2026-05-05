import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge.js';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table.js';

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Table>;

const contributions = [
  { member: 'Thabo Nkosi', month: 'December 2024', amount: 'R500', status: 'Paid' as const },
  { member: 'Naledi Dlamini', month: 'December 2024', amount: 'R500', status: 'Paid' as const },
  { member: 'Sipho Khoza', month: 'December 2024', amount: 'R500', status: 'Pending' as const },
  { member: 'Precious Mokoena', month: 'December 2024', amount: 'R500', status: 'Overdue' as const },
  { member: 'Bongani Zulu', month: 'December 2024', amount: 'R500', status: 'Paid' as const },
];

const variantMap = {
  Paid: 'default',
  Pending: 'secondary',
  Overdue: 'destructive',
} as const;

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Contributions for December 2024</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Month</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contributions.map((c) => (
          <TableRow key={c.member}>
            <TableCell className="font-medium">{c.member}</TableCell>
            <TableCell>{c.month}</TableCell>
            <TableCell>{c.amount}</TableCell>
            <TableCell>
              <Badge variant={variantMap[c.status]}>{c.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell colSpan={2}>R 2 500 / R 4 000</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const MembersTable: Story = {
  render: () => {
    const members = [
      { name: 'Thabo Nkosi', phone: '+27 82 000 0001', payout: 'March 2025', joined: 'Jan 2023' },
      { name: 'Naledi Dlamini', phone: '+27 82 000 0002', payout: 'April 2025', joined: 'Jan 2023' },
      { name: 'Sipho Khoza', phone: '+27 82 000 0003', payout: 'January 2025', joined: 'Jan 2023' },
    ];
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Next payout</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.name}>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell>{m.phone}</TableCell>
              <TableCell>{m.payout}</TableCell>
              <TableCell>{m.joined}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};
