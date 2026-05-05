import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="p-4">
      <p className="text-gray-500">Dashboard — coming in Task #10</p>
    </div>
  );
}
