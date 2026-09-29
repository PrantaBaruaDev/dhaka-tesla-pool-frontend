'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequireAuth } from '@/components/RequireAuth';
import { ZoneSelect } from '@/components/ZoneSelect';
import { Spinner } from '@/components/Spinner';
import { ErrorBox } from '@/components/ErrorBox';
import { api, ApiClientError } from '@/lib/api';
import { poyshaToTaka, metersToKm } from '@/lib/format';
import type { Zone, PaymentMethod } from '@/lib/types';

interface PreviewResponse {
  preview: {
    pickupZone: { id: string; name: string };
    destinationZone: { id: string; name: string };
    seats: number;
    straightLineMeters: number;
    roadDistanceMeters: number;
    estimatedFarePoysha: number;
  };
}

export default function NewRidePage() {
  return (
    <RequireAuth role="PASSENGER">
      <NewRideContent />
    </RequireAuth>
  );
}

function NewRideContent() {
  const router = useRouter();

  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);

  const [pickupZoneId, setPickupZoneId] = useState('');
  const [destinationZoneId, setDestinationZoneId] = useState('');
  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  const [preview, setPreview] = useState<PreviewResponse['preview'] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ zones: Zone[] }>('/api/v1/zones');
        if (!cancelled) setZones(res.zones);
      } catch (err) {
        if (!cancelled) {
          setZonesError(err instanceof Error ? err.message : 'Failed to load zones.');
        }
      } finally {
        if (!cancelled) setZonesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!pickupZoneId || !destinationZoneId) {
      setPreview(null);
      setPreviewError(null);
      return;
    }
    if (pickupZoneId === destinationZoneId) {
      setPreview(null);
      setPreviewError('Pickup and destination must be different.');
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);

    (async () => {
      try {
        const res = await api.post<PreviewResponse>('/api/v1/rides/preview', {
          pickupZoneId,
          destinationZoneId,
          seats,
        });
        if (!cancelled) setPreview(res.preview);
      } catch (err) {
        if (!cancelled) {
          setPreview(null);
          if (err instanceof ApiClientError) setPreviewError(err.message);
          else setPreviewError('Could not compute fare.');
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [pickupZoneId, destinationZoneId, seats]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!pickupZoneId || !destinationZoneId) {
      setSubmitError('Please choose both pickup and destination.');
      return;
    }
    if (pickupZoneId === destinationZoneId) {
      setSubmitError('Pickup and destination must be different.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post<{ rideRequest: { id: string } }>('/api/v1/rides', {
        pickupZoneId,
        destinationZoneId,
        seats,
        paymentMethod,
      });
      router.push(`/passenger/rides/${res.rideRequest.id}`);
    } catch (err) {
      if (err instanceof ApiClientError) setSubmitError(err.message);
      else setSubmitError('Could not create the ride.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Request a ride</h1>
      <p className="text-sm text-gray-600 mb-6">
        Pick your corridor. We&apos;ll match you with a Tesla heading the same way.
      </p>

      <form onSubmit={handleSubmit} className="border rounded p-5 bg-white space-y-4">
        {zonesLoading && <Spinner label="Loading zones…" />}
        {zonesError && <ErrorBox message={zonesError} />}

        {!zonesLoading && !zonesError && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Pickup</label>
              <ZoneSelect
                name="pickup"
                zones={zones}
                value={pickupZoneId}
                onChange={setPickupZoneId}
                placeholder="Select pickup zone"
                excludeId={destinationZoneId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Destination</label>
              <ZoneSelect
                name="destination"
                zones={zones}
                value={destinationZoneId}
                onChange={setDestinationZoneId}
                placeholder="Select destination zone"
                excludeId={pickupZoneId}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Seats</label>
                <select
                  name="seats"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value={1}>1 seat</option>
                  <option value={2}>2 seats</option>
                  <option value={3}>3 seats</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment</label>
                <select
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="CASH">Cash</option>
                  <option value="TESLAPAY">TeslaPay</option>
                </select>
              </div>
            </div>

            <div className="border rounded p-3 bg-gray-50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Distance</span>
                <span className="font-medium">
                  {previewLoading ? '…' : preview ? metersToKm(preview.roadDistanceMeters) : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Estimated fare</span>
                <span data-testid="estimated-fare" className="font-bold">
                  {previewLoading ? '…' : preview ? poyshaToTaka(preview.estimatedFarePoysha) : '—'}
                </span>
              </div>
              {preview && (
                <p className="text-xs text-gray-500 mt-2">
                  Pool discount applied at completion if you share the Tesla.
                </p>
              )}
              {previewError && (
                <p className="text-xs text-red-600 mt-2">{previewError}</p>
              )}
            </div>

            {submitError && <ErrorBox message={submitError} />}

            <button
              type="submit"
              disabled={submitting || !preview}
              className="w-full py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {submitting ? 'Requesting…' : 'Request ride'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}