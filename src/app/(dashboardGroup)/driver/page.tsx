'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { ErrorBox } from '@/components/ErrorBox';
import { OnlineToggle } from '@/components/OnlineToggle';
import { PoolLifecycleCard } from '@/components/PoolLifecycleCard';
import { api, ApiClientError } from '@/lib/api';
import type { ActivePool, DriverRequestsResponse } from '@/lib/types';

const POLL_INTERVAL_MS = 5000;

export default function DriverDashboardPage() {
  return (
    <RequireAuth role="DRIVER">
      <DriverDashboardContent />
    </RequireAuth>
  );
}

function DriverDashboardContent() {
  const [tesla, setTesla] = useState<DriverRequestsResponse['tesla'] | null>(null);
  const [pool, setPool] = useState<ActivePool | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const [reqRes, poolRes] = await Promise.all([
        api.get<DriverRequestsResponse>('/api/v1/driver/requests'),
        api.get<{ pool: ActivePool | null }>('/api/v1/driver/pools/active'),
      ]);
      setTesla(reqRes.tesla);
      setPool(poolRes.pool);
      setError(null);
    } catch (err) {
      if (err instanceof ApiClientError) setError(err.message);
      else setError('Failed to load driver data.');
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

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (error) return <ErrorBox message={error} />;
  if (!tesla) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Driver dashboard</h1>
        <p className="text-sm text-gray-600">
          {tesla.label} · {tesla.capacity} seats
        </p>
      </div>

      <OnlineToggle isOnline={tesla.isOnline} onChange={(v) => setTesla({ ...tesla, isOnline: v })} />

      {pool ? (
        <PoolLifecycleCard pool={pool} onRefresh={load} />
      ) : (
        <div className="border rounded p-5 bg-white text-center text-gray-500 text-sm">
          No active pool.{' '}
          <Link href="/driver/requests" className="text-blue-600 hover:underline">
            Browse requests →
          </Link>
        </div>
      )}
    </div>
  );
}