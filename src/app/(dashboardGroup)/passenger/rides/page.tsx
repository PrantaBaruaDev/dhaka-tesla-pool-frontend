'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { ErrorBox } from '@/components/ErrorBox';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { poyshaToTaka, formatDateTime, metersToKm } from '@/lib/format';
import type { RideRequest } from '@/lib/types';

export default function MyRidesPage() {
  return (
    <RequireAuth role="PASSENGER">
      <MyRidesContent />
    </RequireAuth>
  );
}

function MyRidesContent() {
  const [rides, setRides] = useState<RideRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ rides: RideRequest[] }>('/api/v1/rides/me');
      setRides(res.rides);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rides.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My rides</h1>
        <Link
          href="/passenger/rides/new"
          className="text-sm px-3 py-1.5 bg-black text-white rounded hover:bg-gray-800"
        >
          + New ride
        </Link>
      </div>

      {loading && <Spinner label="Loading rides…" />}
      {error && <ErrorBox message={error} />}
      {!loading && !error && rides && rides.length === 0 && (
        <EmptyState message="You haven't requested a ride yet." />
      )}

      {!loading && !error && rides && rides.length > 0 && (
        <div className="border rounded bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Route</th>
                <th className="px-4 py-2 font-medium">Requested</th>
                <th className="px-4 py-2 font-medium">Distance</th>
                <th className="px-4 py-2 font-medium">Fare</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rides.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">
                    {r.pickupZone?.name ?? '—'} → {r.destinationZone?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDateTime(r.requestedAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {metersToKm(r.roadDistanceMeters)}
                  </td>
                  <td className="px-4 py-3">
                    {r.finalFarePoysha !== null
                      ? <span className="font-medium">{poyshaToTaka(r.finalFarePoysha)}</span>
                      : <span className="text-gray-500">~{poyshaToTaka(r.estimatedFarePoysha)}</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/passenger/rides/${r.id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}