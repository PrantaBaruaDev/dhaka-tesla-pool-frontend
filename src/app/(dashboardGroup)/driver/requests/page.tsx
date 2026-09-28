'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { ErrorBox } from '@/components/ErrorBox';
import { EmptyState } from '@/components/EmptyState';
import { DriverRequestRow } from '@/components/DriverRequestRow';
import { api } from '@/lib/api';
import type { DriverRequestsResponse } from '@/lib/types';

const POLL_INTERVAL_MS = 5000;

export default function DriverRequestsPage() {
  return (
    <RequireAuth role="DRIVER">
      <DriverRequestsContent />
    </RequireAuth>
  );
}

function DriverRequestsContent() {
  const [data, setData] = useState<DriverRequestsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<DriverRequestsResponse>('/api/v1/driver/requests');
      setData(res);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  if (loading) return <Spinner label="Loading requests…" />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Open requests</h1>
          <p className="text-sm text-gray-600">
            {data.tesla.label} · {data.tesla.capacity} seats ·{' '}
            {data.tesla.isOnline ? (
              <span className="text-green-700 font-medium">online</span>
            ) : (
              <span className="text-gray-500">offline</span>
            )}
          </p>
        </div>
        <Link
          href="/driver"
          className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50"
        >
          Dashboard
        </Link>
      </div>

      {!data.tesla.isOnline && (
        <div className="border rounded p-3 bg-yellow-50 border-yellow-200 text-sm text-yellow-800 mb-4">
          You&apos;re offline. Go online on the dashboard to start accepting rides.
        </div>
      )}

      {data.activePoolId && (
        <div className="border rounded p-3 bg-blue-50 border-blue-200 text-sm text-blue-800 mb-4">
          You have an active pool with {data.seatsOccupied}/{data.tesla.capacity} seats filled.
          Requests marked <strong>Matches your pool</strong> can be added directly.
        </div>
      )}

      {data.requests.length === 0 ? (
        <EmptyState message="No open requests right now. Refresh happens every 5 seconds." />
      ) : (
        <div className="space-y-3">
          {data.requests.map((item) => (
            <DriverRequestRow key={item.id} item={item} onAccepted={load} />
          ))}
        </div>
      )}
    </div>
  );
}