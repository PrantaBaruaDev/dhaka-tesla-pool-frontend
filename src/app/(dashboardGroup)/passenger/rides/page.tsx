import { RequireAuth } from '@/components/RequireAuth';

export default function MyRidesPage() {
  return (
    <RequireAuth role="PASSENGER">
      <div className="text-gray-500">My rides.</div>
    </RequireAuth>
  );
}