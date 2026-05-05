import { z } from 'zod';

/**
 * Single source of truth for login credentials.
 * Imported by: BFF login route, login form RHF resolver, api-client, rate limiter (keys on phone).
 */
export const LoginSchema = z.object({
  phone: z
    .string()
    .regex(/^\+27[0-9]{9}$/, 'Enter a valid South African mobile number starting with +27'),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
