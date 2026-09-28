import { RequireAuth } from '@/components/RequireAuth';

export default function DriverRequestsPage() {
  return (
    <RequireAuth role="DRIVER">
      <div className="text-gray-500">Driver requests.</div>
    </RequireAuth>
  );
}