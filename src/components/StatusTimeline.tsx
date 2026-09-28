import type { RideTimelineEntry, RideStatus } from '@/lib/types';
import { formatDateTime } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

interface Props {
  entries: RideTimelineEntry[];
}

export function StatusTimeline({ entries }: Props) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">No transitions recorded yet.</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 ml-2">
      {entries.map((e) => (
        <li key={e.id} className="ml-5 pb-6 last:pb-0">
          <span className="absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full bg-black ring-4 ring-white" />
          <div className="flex items-center gap-2">
            <StatusBadge status={e.toStatus as RideStatus} />
            <span className="text-xs text-gray-500">
              {formatDateTime(e.changedAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            by <strong>{e.changedBy.name}</strong>{' '}
            <span className="text-xs uppercase text-gray-400 tracking-wide">
              {e.changedBy.role}
            </span>
          </p>
        </li>
      ))}
    </ol>
  );
}