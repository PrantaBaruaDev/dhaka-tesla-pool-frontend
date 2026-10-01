'use client';

import { useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { poyshaToTaka } from '@/lib/format';
import { StatusBadge } from './StatusBadge';
import { ErrorBox } from './ErrorBox';
import type { ActivePool, ActivePoolPassenger, RideStatus } from '@/lib/types';

interface Props {
  pool: ActivePool;
  onRefresh: () => Promise<void>;
}

type Action = 'arrive' | 'start' | 'complete';

const ACTION_LABEL: Record<Action, string> = {
  arrive: 'Mark arrival',
  start: 'Start trip',
  complete: 'Complete trip',
};

function nextActionFor(pool: ActivePool, passengers: ActivePoolPassenger[]): Action | null {
  if (pool.status === 'OPEN') {
    const allArrived = passengers.every((p) => p.status === 'DRIVER_ARRIVED');
    return allArrived ? 'start' : 'arrive';
  }
  if (pool.status === 'IN_PROGRESS') return 'complete';
  return null;
}

export function PoolLifecycleCard({ pool, onRefresh }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePassengers = pool.passengers.filter((p) => p.status !== 'CANCELLED');
  const action = nextActionFor(pool, activePassengers);

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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active pool</p>
          <p className="font-mono text-xs text-gray-500 mt-0.5">{pool.id}</p>
        </div>
        <StatusBadge status={pool.status} />
      </div>

      {/* Seats */}
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">Seats</span>
        <span className="font-medium">
          {pool.seatsOccupied} / {pool.capacity}
        </span>
      </div>

      {/* Discount status */}
      {pool.isPooled ? (
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Pooling discount</span>
          <span className="font-medium text-green-700">
            {pool.discountPercent}% off — active
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Pooling discount</span>
          <span className="text-gray-400 text-xs">
            applies when another passenger joins
          </span>
        </div>
      )}

      {/* Projected total */}
      <div className="flex items-center justify-between text-sm mb-5 pt-3 border-t">
        <span className="text-gray-700 font-medium">Projected total</span>
        <span
          className="font-bold text-lg"
          data-testid="projected-total"
        >
          {poyshaToTaka(pool.projectedTotalPoysha)}
        </span>
      </div>

      {/* Passengers with live fare breakdown */}
      <div className="space-y-3 mb-5">
        {activePassengers.map((p) => (
          <div key={p.rideRequestId} className="border rounded p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="font-medium">{p.passengerName}</p>
              <StatusBadge status={p.status as RideStatus} />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {p.pickupZone.name} → {p.destinationZone.name}
            </p>

            <div className="mt-2 text-xs space-y-0.5">
              <div className="flex justify-between text-gray-500">
                <span>
                  {poyshaToTaka(p.perSeatFarePoysha)} × {p.seats} seat{p.seats !== 1 ? 's' : ''}
                </span>
                <span>{poyshaToTaka(p.subtotalPoysha)}</span>
              </div>

              {p.discountPoysha > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Pool discount ({pool.discountPercent}%)</span>
                  <span>− {poyshaToTaka(p.discountPoysha)}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold text-gray-900 pt-1 mt-1 border-t">
                <span>Final fare</span>
                <span data-testid={`fare-${p.rideRequestId}`}>
                  {poyshaToTaka(p.projectedFarePoysha)}
                </span>
              </div>
            </div>
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