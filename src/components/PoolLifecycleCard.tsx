'use client';

import { useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { poyshaToTaka } from '@/lib/format';
import { StatusBadge } from './StatusBadge';
import { ErrorBox } from './ErrorBox';
import type { ActivePool, ActivePoolPassenger, RideStatus } from '@/lib/types';
import { PassengerNameButton } from './PassengerNameButton';

interface Props {
  pool: ActivePool;
  onRefresh: () => Promise<void>;
}

type Action = 'arrive' | 'start' | 'complete';



function nextActionFor(pool: ActivePool, passengers: ActivePoolPassenger[]): Action | null {
  if (pool.status === 'OPEN') {
    const allArrived = passengers.every((p) => p.status === 'DRIVER_ARRIVED');
    return allArrived ? 'start' : 'arrive';
  }
  if (pool.status === 'IN_PROGRESS') return 'complete';
  return null;
}

const ACTION_LABEL: Record<Action, string> = {
  arrive: 'Mark arrival',
  start: 'Start trip',
  complete: 'Complete trip',
};

export function PoolLifecycleCard({ pool, onRefresh }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const activePassengers = pool.passengers.filter((p) => p.status !== 'CANCELLED');

  const action = nextActionFor(pool, activePassengers );

  async function handleAction() {
    if (!action) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/v1/driver/pools/${pool.id}/${action}`);
      await onRefresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border rounded p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active pool</p>
          <p className="font-mono text-xs text-gray-500 mt-0.5">{pool.id}</p>
        </div>
        <StatusBadge status={pool.status} />
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-gray-600">Seats</span>
        <span className="font-medium">
          {pool.seatsOccupied} / {pool.capacity}
        </span>
      </div>

      <div className="space-y-3 mb-5">
        {pool.passengers.map((p) => (
          <div key={p.rideRequestId} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <PassengerNameButton
                passengerId={p.passengerId}
                passengerName={p.passengerName}
              />
              <StatusBadge status={p.status as RideStatus} />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {p.pickupZone.name} → {p.destinationZone.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {p.seats} seat · est {poyshaToTaka(p.estimatedFarePoysha)}
            </p>
          </div>
        ))}
      </div>

      {error && <ErrorBox message={error} />}

      {action ? (
        <button
          onClick={handleAction}
          disabled={busy}
          data-testid={`pool-action-${action}`}
          className="w-full py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {busy ? '…' : ACTION_LABEL[action]}
        </button>
      ) : (
        <p className="text-sm text-gray-500 text-center">
          This pool is {pool.status.toLowerCase()}.
        </p>
      )}
    </div>
  );
}