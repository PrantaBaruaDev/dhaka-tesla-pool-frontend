export function poyshaToTaka(poysha: number | null | undefined): string {
  if (poysha === null || poysha === undefined) return '—';
  return `৳${(poysha / 100).toFixed(2)}`;
}

export function metersToKm(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'REQUESTED':       return 'Waiting for driver';
    case 'MATCHED':         return 'Driver assigned';
    case 'DRIVER_ARRIVED':  return 'Driver arrived';
    case 'STARTED':         return 'In progress';
    case 'COMPLETED':       return 'Completed';
    case 'CANCELLED':       return 'Cancelled';
    case 'OPEN':            return 'Open';
    case 'IN_PROGRESS':     return 'In progress';
    default:                return status;
  }
}