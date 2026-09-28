import { RequireAuth } from '@/components/RequireAuth';

export default function DriverHistoryPage() {
  return (
    <RequireAuth role="DRIVER">
      <div className="text-gray-500">Driver history</div>
    </RequireAuth>
  );
}