import type { RideStatus, PoolStatus } from '@/lib/types';

const RIDE_COLORS: Record<RideStatus, string> = {
  REQUESTED:      'bg-yellow-100 text-yellow-800 border-yellow-200',
  MATCHED:        'bg-blue-100 text-blue-800 border-blue-200',
  DRIVER_ARRIVED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  STARTED:        'bg-purple-100 text-purple-800 border-purple-200',
  COMPLETED:      'bg-green-100 text-green-800 border-green-200',
  CANCELLED:      'bg-gray-100 text-gray-700 border-gray-200',
};

const POOL_COLORS: Record<PoolStatus, string> = {
  OPEN:        'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
  COMPLETED:   'bg-green-100 text-green-800 border-green-200',
  CANCELLED:   'bg-gray-100 text-gray-700 border-gray-200',
};

const LABELS: Record<string, string> = {
  REQUESTED: 'Waiting',
  MATCHED: 'Matched',
  DRIVER_ARRIVED: 'Arrived',
  STARTED: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
};

interface Props {
  status: RideStatus | PoolStatus;
}

export function StatusBadge({ status }: Props) {
  const cls =
    (RIDE_COLORS as Record<string, string>)[status] ??
    (POOL_COLORS as Record<string, string>)[status] ??
    'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span
      data-testid={`status-badge-${status}`}
      className={`inline-flex items-center text-xs font-medium border rounded-full px-2 py-0.5 ${cls}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}