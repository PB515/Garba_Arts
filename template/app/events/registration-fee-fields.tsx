'use client';

import { useState } from 'react';
import { AttendeeRows } from './attendee-rows';

/**
 * Wraps AttendeeRows with a fee_amount input whose default auto-computes as
 * (1 + attendee count) x feePerPerson (decision #86) - the owner's own
 * example: "5 people, fee per person is 200, one main who registers gives
 * 1000". Still a normal editable number field, so a genuine exception (a
 * discount, a free plus-one) can override it - once touched directly, the
 * auto-calc stops overwriting it, same "auto-computed but overridable"
 * principle as every other typical-but-editable number in this app.
 *
 * Only used on the admin "Add registration" form - the edit form keeps a
 * plain manual fee_amount field (RegistrationEditRow), since re-opening an
 * edit form to fix a phone number shouldn't silently recalculate an
 * already-set fee.
 */
export function RegistrationFeeFields({
  fieldClass,
  feePerPerson,
  maxAttendees,
}: {
  fieldClass: string;
  feePerPerson: number | null;
  maxAttendees?: number;
}) {
  const [count, setCount] = useState(0);
  const [touched, setTouched] = useState(false);
  const [value, setValue] = useState('');

  const computed = feePerPerson != null ? (1 + count) * feePerPerson : null;
  const displayValue = touched ? value : (computed != null ? String(computed) : '');

  return (
    <>
      <input
        name="fee_amount"
        type="number"
        step="1"
        min="0"
        placeholder={feePerPerson != null ? undefined : 'Fee (leave blank if free)'}
        value={displayValue}
        onChange={(e) => {
          setTouched(true);
          setValue(e.target.value);
        }}
        className={fieldClass}
      />
      <AttendeeRows fieldClass={fieldClass} maxAttendees={maxAttendees} onCountChange={setCount} />
    </>
  );
}
