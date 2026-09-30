'use client';

import { useState } from 'react';
import { PassengerProfileModal } from './PassengerProfileModal';

interface Props {
  passengerId: string;
  passengerName: string;
}

export function PassengerNameButton({ passengerId, passengerName }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-medium text-left hover:text-blue-600 hover:underline"
        data-testid={`passenger-name-${passengerId}`}
      >
        {passengerName}
      </button>
      {open && (
        <PassengerProfileModal
          passengerId={passengerId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}