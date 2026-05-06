import { createFileRoute } from '@tanstack/react-router';
import { useCopy } from '../../copy/index.js';
import { MakeContributionForm } from '../../features/contributions/MakeContributionForm.js';
import { DEMO_STOKVEL_ID } from '../../lib/demo.js';

export const Route = createFileRoute('/_authed/contributions/new')({
  component: MakeContributionPage,
});

function MakeContributionPage() {
  const copy = useCopy();
  const { auth } = Route.useRouteContext();
  const memberId = auth?.isAuthenticated ? auth.member.id : '';

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold text-gray-900">
        {copy.contributions.makeContributionButton}
      </h1>
      <MakeContributionForm stokvelId={DEMO_STOKVEL_ID} memberId={memberId} />
    </div>
  );
}
