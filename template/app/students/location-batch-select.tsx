'use client';

import { useState } from 'react';

interface Loc {
  id: string;
  name: string;
}
interface Batch {
  id: string;
  name: string;
  location_id: string;
}

/**
 * Cascading location -> batch selects. Each location has its own batches
 * (e.g. both "Aliya" and "Sportsclub" have an "8-9 PM" batch), so picking a
 * location filters the batch list down to just its own — no need to
 * qualify batch names with the location once this is in place.
 */
export function LocationBatchSelect({
  locations,
  batches,
  locationField,
  batchField,
  defaultLocationId = '',
  defaultBatchId = '',
  locationPlaceholder = 'Location',
  batchPlaceholder = 'Batch',
  className,
}: {
  locations: Loc[];
  batches: Batch[];
  locationField: string;
  batchField: string;
  defaultLocationId?: string;
  defaultBatchId?: string;
  locationPlaceholder?: string;
  batchPlaceholder?: string;
  className?: string;
}) {
  const [locationId, setLocationId] = useState(defaultLocationId);
  const [batchId, setBatchId] = useState(defaultBatchId);

  const filteredBatches = locationId ? batches.filter((b) => b.location_id === locationId) : batches;

  function handleLocationChange(next: string) {
    setLocationId(next);
    const stillValid = batches.some((b) => b.id === batchId && b.location_id === next);
    if (!stillValid) setBatchId('');
  }

  return (
    <>
      <select
        name={locationField}
        value={locationId}
        onChange={(e) => handleLocationChange(e.target.value)}
        className={className}
      >
        <option value="">{locationPlaceholder}</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
      <select name={batchField} value={batchId} onChange={(e) => setBatchId(e.target.value)} className={className}>
        <option value="">{batchPlaceholder}</option>
        {filteredBatches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </>
  );
}
