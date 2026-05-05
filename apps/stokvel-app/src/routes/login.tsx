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
          <div className="pt-2">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-white/40">
              or
            </p>
            <button
              type="button"
              onClick={triggerInstall}
              className="group flex w-full items-center gap-4 rounded-2xl bg-white/10 p-4 text-left backdrop-blur-sm transition-all hover:bg-white/20 active:scale-[0.98]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{copy.pwa.installButtonDesktop}</p>
                <p className="truncate text-xs text-white/60">{copy.pwa.installPromptBody}</p>
              </div>
              <svg
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-white/40 transition-transform group-hover:translate-y-0.5"
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
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
