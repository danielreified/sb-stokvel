import { formatDate, formatPhone } from '@seyva/utils';
import { createFileRoute } from '@tanstack/react-router';
import { copy, interpolate } from '../../copy/index.js';
import { signOut } from '../../features/auth/sign-out.js';
import { InstallPromptBanner } from '../../features/pwa/InstallPromptBanner.js';

export const Route = createFileRoute('/_authed/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { auth } = Route.useRouteContext();
  const member = auth?.isAuthenticated ? auth.member : null;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold text-gray-900">{copy.profile.pageTitle}</h1>

      {member && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-500">{formatPhone(member.phone)}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            {interpolate(copy.profile.memberSince, { date: formatDate(member.joinedAt) })}
          </p>
        </div>
      )}

      <InstallPromptBanner />

      <button
        type="button"
        onClick={() => void signOut()}
        className="w-full rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600"
      >
        {copy.auth.logoutButton}
      </button>
    </div>
  );
}
