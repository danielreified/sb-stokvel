import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Calendar } from './calendar.js';

const meta: Meta<typeof Calendar> = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    );
  },
};

export const WithSelectedDate: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date(2024, 11, 6));
    return (
      <div className="flex flex-col gap-2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        <p className="text-sm text-muted-foreground text-center">
          {date ? `Contribution date: ${date.toLocaleDateString('en-ZA')}` : 'No date selected'}
        </p>
      </div>
    );
  },
};

export const RangeSelection: Story = {
  render: () => {
    const [range, setRange] = useState<{ from?: Date; to?: Date } | undefined>();
    return (
      <Calendar
        mode="range"
        selected={range as { from: Date; to?: Date } | undefined}
        onSelect={(val) => setRange(val as { from?: Date; to?: Date } | undefined)}
        className="rounded-md border"
      />
    );
  },
};
