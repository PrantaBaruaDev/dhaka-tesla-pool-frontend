'use client';

import type { Zone } from '@/lib/types';

interface Props {
  zones: Zone[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  excludeId?: string;
  name: string;
}

export function ZoneSelect({ zones, value, onChange, placeholder, excludeId, name }: Props) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
    >
      <option value="">{placeholder}</option>
      {zones
        .filter((z) => z.id !== excludeId)
        .map((z) => (
          <option key={z.id} value={z.id}>
            {z.name}
          </option>
        ))}
    </select>
  );
}