import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent } from './card.js';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel.js';

const meta: Meta<typeof Carousel> = {
  title: 'UI/Carousel',
  component: Carousel,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Carousel>;

const months = ['October 2024', 'November 2024', 'December 2024', 'January 2025'];
const amounts = ['R 500', 'R 500', 'R 500', 'R 500'];

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-sm mx-auto">
      <Carousel>
        <CarouselContent>
          {months.map((month, i) => (
            <CarouselItem key={month}>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                  <span className="text-sm text-muted-foreground">{month}</span>
                  <span className="text-3xl font-bold">{amounts[i]}</span>
                  <span className="text-xs text-muted-foreground">Contribution</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const MemberCards: Story = {
  render: () => {
    const members = [
      { name: 'Thabo Nkosi', status: 'Paid' },
      { name: 'Naledi Dlamini', status: 'Pending' },
      { name: 'Sipho Khoza', status: 'Paid' },
      { name: 'Precious Mokoena', status: 'Overdue' },
    ];
    return (
      <div className="w-full max-w-xs mx-auto">
        <Carousel opts={{ align: 'start' }}>
          <CarouselContent>
            {members.map((m) => (
              <CarouselItem key={m.name} className="basis-3/4">
                <Card>
                  <CardContent className="p-4">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-muted-foreground">{m.status}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    );
  },
};
