'use client';

import { useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { poyshaToTaka, metersToKm, formatTime } from '@/lib/format';
import { ErrorBox } from './ErrorBox';
import type { DriverRequestItem } from '@/lib/types';
import { PassengerNameButton } from './PassengerNameButton';

interface Props {
  item: DriverRequestItem;
  onAccepted: () => Promise<void>;
}

export function DriverRequestRow({ item, onAccepted }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/v1/driver/requests/${item.id}/accept`);
      await onAccepted();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === 'POOL_FULL') setError('No seats left in your Tesla.');
        else if (err.code === 'CLUSTER_MISMATCH') setError('Different corridor than your active pool.');
        else setError(err.message);
      } else {
        setError('Could not accept.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border rounded p-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <PassengerNameButton
              passengerId={item.passenger.id}
              passengerName={item.passenger.name}
            />
            {item.canJoinActivePool && (
              <span className="text-xs border rounded-full px-2 py-0.5 bg-blue-50 text-blue-800 border-blue-200">
                Matches your pool
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-1">
            {item.pickupZone.name} → {item.destinationZone.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {item.seatsRequested} seat · {metersToKm(item.roadDistanceMeters)} ·{' '}
            {poyshaToTaka(item.estimatedFarePoysha)} · requested {formatTime(item.requestedAt)}
          </p>
        </div>

        <button
          onClick={accept}
          disabled={busy}
          data-testid={`accept-${item.id}`}
          className="ml-4 px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {busy ? '…' : 'Accept'}
        </button>
      </div>

      {error && <div className="mt-3"><ErrorBox message={error} /></div>}
    </div>
  );
}