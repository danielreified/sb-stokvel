import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  reason: z.enum(['expired']).optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context, search }) => {
    // Already authenticated — redirect to the intended destination or dashboard
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: search.redirect ?? '/_authed/dashboard' });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand p-4">
      <p className="text-white">Login — coming in Task #9</p>
    </div>
  );
}
