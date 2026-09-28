import { RequireAuth } from '@/components/RequireAuth';

export default function DriverDashboardPage() {
  return (
    <RequireAuth role="DRIVER">
      <div className="text-gray-500">Driver dashboard</div>
    </RequireAuth>
  );
}