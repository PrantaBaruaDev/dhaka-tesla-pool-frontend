'use client';

import { useCallback, useEffect, useState } from 'react';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { ErrorBox } from '@/components/ErrorBox';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { poyshaToTaka, formatDateTime } from '@/lib/format';
import type { RideStatus } from '@/lib/types';

interface HistoryPassenger {
  rideRequestId: string;
  passengerName: string;
  status: RideStatus;
  pickupZone: string;
  destinationZone: string;
  finalFarePoysha: number | null;
}

interface HistoryPool {
  id: string;
  status: string;
  seatsOccupied: number;
  startedAt: string | null;
  completedAt: string | null;
  passengers: HistoryPassenger[];
}

export default function DriverHistoryPage() {
  return (
    <RequireAuth role="DRIVER">
      <DriverHistoryContent />
    </RequireAuth>
  );
}

function DriverHistoryContent() {
  const [pools, setPools] = useState<HistoryPool[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ pools: HistoryPool[] }>('/api/v1/driver/pools/history');
      setPools(res.pools);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner label="Loading history…" />;
  if (error) return <ErrorBox message={error} />;
  if (!pools) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ride history</h1>

      {pools.length === 0 ? (
        <EmptyState message="No completed trips yet." />
      ) : (
        <div className="space-y-4">
          {pools.map((pool) => {
            const totalFare = pool.passengers.reduce(
              (sum, p) => sum + (p.finalFarePoysha ?? 0),
              0,
            );
            return (
              <div key={pool.id} className="border rounded p-5 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-mono text-xs text-gray-500">{pool.id}</p>
                    <p className="text-sm text-gray-600">
                      {pool.completedAt
                        ? `Completed ${formatDateTime(pool.completedAt)}`
                        : pool.startedAt
                        ? `Started ${formatDateTime(pool.startedAt)}`
                        : 'Not started'}
                    </p>
                  </div>
                  <StatusBadge status={pool.status as RideStatus} />
                </div>

                <div className="border-t pt-3 space-y-2">
                  {pool.passengers.map((p) => (
                    <div key={p.rideRequestId} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{p.passengerName}</p>
                        <p className="text-xs text-gray-500">
                          {p.pickupZone} → {p.destinationZone}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {p.finalFarePoysha !== null ? poyshaToTaka(p.finalFarePoysha) : '—'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {pool.seatsOccupied} seat{pool.seatsOccupied !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-3 pt-3 flex justify-between text-sm">
                  <span className="text-gray-600">Total collected</span>
                  <span className="font-bold">{poyshaToTaka(totalFare)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}