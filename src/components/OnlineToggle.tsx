'use client';

import { useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { ErrorBox } from './ErrorBox';

interface Props {
  isOnline: boolean;
  onChange: (next: boolean) => void;
}

export function OnlineToggle({ isOnline, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ tesla: { isOnline: boolean } }>(
        '/api/v1/driver/status',
        { online: !isOnline },
      );
      onChange(res.tesla.isOnline);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update status.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={toggle}
        disabled={busy}
        data-testid="online-toggle"
        className={`w-full py-3 rounded font-medium transition ${
          isOnline
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        } disabled:opacity-50`}
      >
        {busy ? '…' : isOnline ? '● Online — tap to go offline' : '○ Offline — tap to go online'}
      </button>
      {error && <ErrorBox message={error} />}
    </div>
  );
}