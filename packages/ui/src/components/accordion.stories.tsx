import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion.js';

const meta: Meta<typeof Accordion> = {
  title: 'UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="rules">
        <AccordionTrigger>Stokvel Rules</AccordionTrigger>
        <AccordionContent>
          Members contribute R500 on the first Friday of each month. Late payments incur a R50 penalty. Missed payments are reviewed by the committee.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="payout">
        <AccordionTrigger>Payout Schedule</AccordionTrigger>
        <AccordionContent>
          Payouts rotate alphabetically. Thabo receives January, Naledi receives February, and so on. The full schedule is published at the start of each year.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="membership">
        <AccordionTrigger>Membership Requirements</AccordionTrigger>
        <AccordionContent>
          New members must be referred by an existing member and approved by a two-thirds majority vote. A joining fee of R200 applies.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="rules">
        <AccordionTrigger>Stokvel Rules</AccordionTrigger>
        <AccordionContent>Members contribute R500 monthly.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="payout">
        <AccordionTrigger>Payout Schedule</AccordionTrigger>
        <AccordionContent>Rotating monthly payouts starting with Thabo in January.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
