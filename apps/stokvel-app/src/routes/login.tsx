import { Logo } from '@seyva/ui';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Download } from 'lucide-react';
import { z } from 'zod';
import { useCopy } from '../copy/index.js';
import { LoginForm } from '../features/auth/LoginForm.js';
import { useInstallPrompt } from '../features/pwa/use-install-prompt.js';
import { AppWindow } from '../layout/AppWindow.js';
import { MarketingShell } from '../layout/MarketingShell.js';
import { useStandaloneDisplay } from '../lib/use-standalone-display.js';

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
  const copy = useCopy();
  const { redirect: redirectTo, reason } = Route.useSearch();
  const { canInstall, triggerInstall } = useInstallPrompt();
  const isStandalone = useStandaloneDisplay();

  const inner = (
    <AppWindow member={null}>
      <div className="flex h-full w-full flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-md">
              <Logo variant="mark" tone="light" className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{copy.auth.loginTitle}</h1>
              <p className="text-sm text-muted-foreground">{copy.auth.loginSubtitle}</p>
            </div>
          </div>
          <LoginForm redirectTo={redirectTo} reason={reason} />
          {canInstall && (
            <div className="pt-2">
              <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
                or
              </p>
              <button
                type="button"
                onClick={triggerInstall}
                className="group flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-all hover:bg-accent active:scale-[0.98]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                  <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{copy.pwa.installButtonDesktop}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {copy.pwa.installPromptBody}
                  </p>
                </div>
                <Download
                  aria-hidden="true"
                  className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </AppWindow>
  );

  // Bare AppWindow for installed PWA (feels native, no SB chrome);
  // MarketingShell on the web tab so the demo reads as a Standard Bank
  // product page. See _authed.tsx for the same split.
  return isStandalone ? inner : <MarketingShell>{inner}</MarketingShell>;
}
