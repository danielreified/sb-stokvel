export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-7 w-48 rounded-lg bg-gray-200" />
      <div className="h-32 rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-2xl bg-gray-200" />
        <div className="h-20 rounded-2xl bg-gray-200" />
      </div>
      <div className="h-24 rounded-2xl bg-gray-200" />
    </div>
  );
}
