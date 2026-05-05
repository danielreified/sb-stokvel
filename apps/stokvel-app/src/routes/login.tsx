import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { copy } from '../copy/index.js';
import { LoginForm } from '../features/auth/LoginForm.js';

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  reason: z.enum(['expired']).optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: search.redirect ?? '/dashboard' });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo, reason } = Route.useSearch();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-white">{copy.auth.loginTitle}</h1>
          <p className="text-sm text-white/70">{copy.auth.loginSubtitle}</p>
        </div>
        <LoginForm redirectTo={redirectTo} reason={reason} />
      </div>
    </div>
  );
}
