import { Button } from '@seyva/ui';
import { formatPhone } from '@seyva/utils';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { MemberAvatar } from '../../components/MemberAvatar.js';
import { useCopy } from '../../copy/index.js';
import { meQueryOptions } from '../../features/auth/queries.js';
import { signOut } from '../../features/auth/sign-out.js';
import { DashboardSkeleton } from '../../features/dashboard/DashboardSkeleton.js';
import { InstallPromptBanner } from '../../features/pwa/InstallPromptBanner.js';
import { RouteErrorPanel } from '../../layout/RouteErrorPanel.js';

export const Route = createFileRoute('/_authed/profile')({
  pendingComponent: DashboardSkeleton,
  errorComponent: ProfileErrorComponent,
  component: ProfilePage,
});

function ProfileErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  const copy = useCopy();
  return (
    <RouteErrorPanel
      message={copy.errors.unexpected}
      detail={error instanceof Error ? error.message : undefined}
      onRetry={reset}
    />
  );
}

function ProfilePage() {
  const copy = useCopy();
  const { data } = useQuery(meQueryOptions);
  const member = data?.member ?? null;

  if (!member) return null;

  const settingsItems = [
    copy.profile.accountSettings,
    copy.profile.notifications,
    copy.profile.privacySecurity,
    copy.profile.helpSupport,
  ];

  return (
    <div className="space-y-5 p-6">
      <h2 className="text-xl font-semibold">{copy.profile.pageTitle}</h2>

      <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
        <MemberAvatar name={member.name} size="md" tone="solid" />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{member.name}</p>
          <p className="text-sm text-muted-foreground">{formatPhone(member.phone)}</p>
        </div>
      </div>

      <div className="divide-y rounded-lg border bg-card">
        {settingsItems.map((item) => (
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
        className="w-full border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
      >
        {copy.auth.logoutButton}
      </Button>
    </div>
  );
}
