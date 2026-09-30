'use client';

import { useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { poyshaToTaka, formatDateTime } from '@/lib/format';
import { Spinner } from './Spinner';
import { ErrorBox } from './ErrorBox';
import { StatusBadge } from './StatusBadge';
import type { RideStatus } from '@/lib/types';

interface Profile {
  passenger: {
    id: string;
    name: string;
    email: string;
    role: string;
    joinedAt: string;
  };
  stats: { totalRides: number; totalFarePoysha: number };
  ridesWithYou: Array<{
    rideRequestId: string;
    pickupZone: string;
    destinationZone: string;
    status: string;
    finalFarePoysha: number | null;
    requestedAt: string;
  }>;
}

interface Props {
  passengerId: string;
  onClose: () => void;
}

export function PassengerProfileModal({ passengerId, onClose }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<Profile>(`/api/v1/driver/passengers/${passengerId}`);
        if (!cancelled) setProfile(res);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : 'Failed to load profile.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [passengerId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="passenger-profile-modal"
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-semibold">Passenger profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {loading && <Spinner label="Loading profile…" />}
          {error && <ErrorBox message={error} />}

          {!loading && !error && profile && (
            <>
              <div className="space-y-1">
                <p className="text-xl font-bold">{profile.passenger.name}</p>
                <p className="text-sm text-gray-600">{profile.passenger.email}</p>
                <p className="text-xs text-gray-400 font-mono">{profile.passenger.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
                <div className="border rounded p-3">
                  <p className="text-gray-500 text-xs">Rides with you</p>
                  <p className="font-bold text-lg">{profile.stats.totalRides}</p>
                </div>
                <div className="border rounded p-3">
                  <p className="text-gray-500 text-xs">Total spent</p>
                  <p className="font-bold text-lg">
                    {poyshaToTaka(profile.stats.totalFarePoysha)}
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-medium mt-6 mb-2">Recent rides</h3>
              {profile.ridesWithYou.length === 0 ? (
                <p className="text-sm text-gray-500">No rides with you yet.</p>
              ) : (
                <ul className="space-y-2">
                  {profile.ridesWithYou.map((r) => (
                    <li key={r.rideRequestId} className="border rounded p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {r.pickupZone} → {r.destinationZone}
                        </span>
                        <StatusBadge status={r.status as RideStatus} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>{formatDateTime(r.requestedAt)}</span>
                        <span>
                          {r.finalFarePoysha !== null
                            ? poyshaToTaka(r.finalFarePoysha)
                            : '—'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}