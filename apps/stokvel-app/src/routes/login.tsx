import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand p-4">
      <p className="text-white">Login — coming in Task #9</p>
    </div>
  );
}
