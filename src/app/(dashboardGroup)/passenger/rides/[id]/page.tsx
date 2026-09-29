'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { ErrorBox } from '@/components/ErrorBox';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusTimeline } from '@/components/StatusTimeline';
import { api, ApiClientError } from '@/lib/api';
import { poyshaToTaka, metersToKm, formatDateTime } from '@/lib/format';
import type { RideRequest, RideHistory } from '@/lib/types';

const POLL_INTERVAL_MS = 5000;
const ACTIVE_STATUSES = ['REQUESTED', 'MATCHED', 'DRIVER_ARRIVED', 'STARTED'];

interface RideResponse {
  rideRequest: RideRequest & {
    pool?: {
      id: string;
      status: string;
      tesla?: {
        id: string;
        label: string;
        capacity: number;
        driver: { id: string; name: string };
      };
    } | null;
  };
}

export default function RideDetailPage() {
  return (
    <RequireAuth role="PASSENGER">
      <RideDetailContent />
    </RequireAuth>
  );
}

function RideDetailContent() {
  const params = useParams<{ id: string }>();
  const rideId = params?.id;

  const [ride, setRide] = useState<RideResponse['rideRequest'] | null>(null);
  const [history, setHistory] = useState<RideHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    if (!rideId) return;
    try {
      const [rideRes, historyRes] = await Promise.all([
        api.get<RideResponse>(`/api/v1/rides/${rideId}`),
        api.get<{ history: RideHistory }>(`/api/v1/rides/${rideId}/history`),
      ]);
      setRide(rideRes.rideRequest);
      setHistory(historyRes.history);
      setError(null);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 403) {
        setError('This ride does not belong to your account.');
      } else if (err instanceof ApiClientError && err.status === 404) {
        setError('This ride no longer exists.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load ride.');
      }
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!ride) return;
    if (!ACTIVE_STATUSES.includes(ride.status)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [ride, fetchAll]);

  async function handleCancel() {
    if (!rideId) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await api.post(`/api/v1/rides/${rideId}/cancel`);
      setConfirmCancel(false);
      await fetchAll();
    } catch (err) {
      if (err instanceof ApiClientError) setCancelError(err.message);
      else setCancelError('Could not cancel the ride.');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <Spinner label="Loading ride…" />;
  if (error) return <ErrorBox message={error} />;
  if (!ride) return null;

  const canCancel = ride.status === 'REQUESTED' || ride.status === 'MATCHED';
  const driver = ride.pool?.tesla?.driver;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link href="/passenger/rides" className="text-sm text-gray-500 hover:underline">
          ← My rides
        </Link>
        <StatusBadge status={ride.status} />
      </div>

      <div className="border rounded p-5 bg-white">
        <h1 className="text-xl font-bold">
          {ride.pickupZone?.name} → {ride.destinationZone?.name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Requested {formatDateTime(ride.requestedAt)}
        </p>

        <dl className="grid grid-cols-2 gap-3 mt-5 text-sm">
          <div>
            <dt className="text-gray-500">Seats</dt>
            <dd className="font-medium">{ride.seatsRequested}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Distance</dt>
            <dd className="font-medium">{metersToKm(ride.roadDistanceMeters)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Estimate</dt>
            <dd className="font-medium">{poyshaToTaka(ride.estimatedFarePoysha)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">
              {ride.finalFarePoysha !== null ? 'Final fare' : 'Payment'}
            </dt>
            <dd className="font-medium">
              {ride.finalFarePoysha !== null
                ? poyshaToTaka(ride.finalFarePoysha)
                : ride.paymentMethod === 'CASH' ? 'Cash' : 'TeslaPay'}
            </dd>
          </div>
        </dl>

        {driver && (
          <div className="mt-5 border-t pt-4">
            <p className="text-sm text-gray-500">Driver</p>
            <p className="font-medium">{driver.name}</p>
            <p className="text-xs text-gray-500">
              {ride.pool?.tesla?.label} · {ride.pool?.tesla?.capacity} seats
            </p>
          </div>
        )}
      </div>

      <div className="border rounded p-5 bg-white mt-4">
        <h2 className="font-medium mb-4">Status</h2>
        {history && <StatusTimeline entries={history.timeline} />}
      </div>

      {canCancel && (
        <div className="border rounded p-5 bg-white mt-4">
          {!confirmCancel ? (
            <button
              onClick={() => setConfirmCancel(true)}
              className="text-red-600 text-sm hover:underline"
            >
              Cancel this ride
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">
                Cancelling frees the seat for other passengers. Continue?
              </p>
              {cancelError && <ErrorBox message={cancelError} />}
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                </button>
                <button
                  onClick={() => { setConfirmCancel(false); setCancelError(null); }}
                  disabled={cancelling}
                  className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50"
                >
                  Keep ride
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}