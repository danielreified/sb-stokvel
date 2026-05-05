import type { Meta, StoryObj } from '@storybook/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { Button } from './button.js';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './form.js';
import { Input } from './input.js';

const meta: Meta = {
  title: 'UI/Form',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

const loginSchema = z.object({
  phone: z.string().regex(/^\+27[0-9]{9}$/, 'Enter a valid SA number e.g. +27821234567'),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginForm: Story = {
  render: () => {
    const form = useForm<LoginValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: { phone: '', pin: '' },
    });

    function onSubmit(values: LoginValues) {
      console.log(values);
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-80 space-y-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input placeholder="+27 82 123 4567" type="tel" {...field} />
                </FormControl>
                <FormDescription>Your South African mobile number.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIN</FormLabel>
                <FormControl>
                  <Input placeholder="4-digit PIN" type="password" maxLength={4} {...field} />
                </FormControl>
                <FormDescription>The 4-digit PIN you set when you joined.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
      </Form>
    );
  },
};

export const WithErrors: Story = {
  render: () => {
    const form = useForm<LoginValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: { phone: 'not-a-number', pin: 'abc' },
      mode: 'onChange',
    });

    function onSubmit(values: LoginValues) {
      console.log(values);
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-80 space-y-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input placeholder="+27 82 123 4567" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIN</FormLabel>
                <FormControl>
                  <Input placeholder="4-digit PIN" type="password" maxLength={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" onClick={() => form.trigger()}>
            Sign in
          </Button>
        </form>
      </Form>
    );
  },
};
