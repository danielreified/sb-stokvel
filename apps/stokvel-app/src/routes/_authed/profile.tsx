import { Button } from '@seyva/ui';
import { formatPhone } from '@seyva/utils';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { copy } from '../../copy/index.js';
import { meQueryOptions } from '../../features/auth/queries.js';
import { signOut } from '../../features/auth/sign-out.js';
import { InstallPromptBanner } from '../../features/pwa/InstallPromptBanner.js';
import { initialsOf } from '../../lib/initials.js';

export const Route = createFileRoute('/_authed/profile')({
  component: ProfilePage,
});

const SETTINGS_ITEMS = [
  copy.profile.accountSettings,
  copy.profile.notifications,
  copy.profile.privacySecurity,
  copy.profile.helpSupport,
] as const;

function ProfilePage() {
  const { data } = useQuery(meQueryOptions);
  const member = data?.member ?? null;

  if (!member) return null;

  return (
    <div className="space-y-5 p-6">
      <h2 className="text-xl font-semibold">{copy.profile.pageTitle}</h2>

      <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {initialsOf(member.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{member.name}</p>
          <p className="text-sm text-muted-foreground">{formatPhone(member.phone)}</p>
        </div>
      </div>

      <div className="divide-y rounded-lg border bg-card">
        {SETTINGS_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            className="flex w-full items-center justify-between p-4 text-sm transition-colors hover:bg-muted/50"
          >
            <span>{item}</span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
          </button>
        ))}
      </div>

      <InstallPromptBanner />

      <Button
        variant="outline"
        onClick={() => void signOut()}
        className="w-full border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {copy.auth.logoutButton}
      </Button>
    </div>
  );
}
