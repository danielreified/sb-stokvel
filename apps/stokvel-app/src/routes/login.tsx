import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { copy } from '../copy/index.js';
import { LoginForm } from '../features/auth/LoginForm.js';
import { useInstallPrompt } from '../features/pwa/use-install-prompt.js';

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
  const { canInstall, triggerInstall } = useInstallPrompt();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-white">{copy.auth.loginTitle}</h1>
          <p className="text-sm text-white/70">{copy.auth.loginSubtitle}</p>
        </div>
        <LoginForm redirectTo={redirectTo} reason={reason} />
        {canInstall && (
          <button
            type="button"
            onClick={triggerInstall}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/30 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {copy.pwa.installButtonDesktop}
          </button>
        )}
      </div>
    </div>
  );
}
