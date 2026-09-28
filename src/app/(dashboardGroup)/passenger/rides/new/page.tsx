import { RequireAuth } from '@/components/RequireAuth';

export default function NewRidePage() {
  return (
    <RequireAuth role="PASSENGER">
      <div className="text-gray-500">New ride page.</div>
    </RequireAuth>
  );
}