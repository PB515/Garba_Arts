'use client';

import { useState } from 'react';

/**
 * Mode select + amount field(s) for the "Log payment" form. Plain cash/upi
 * keeps a single Amount box. Cash + UPI (split) swaps it for two boxes -
 * Cash amount and UPI amount - since the owner wants the actual split
 * stored (Fees tab reconciles Total Cash + Total UPI against the grand
 * total), not just a combined figure.
 *
 * Amounts are whole rupees only (decision #82 - "we deal in 100s not in
 * paisa"): no decimal step, no fractional entry. The browser's native
 * number-input spinner arrows are hidden globally (globals.css), since
 * hiding them per-input isn't possible with plain Tailwind utilities.
 *
 * A UPI transaction ID field appears whenever UPI is part of the payment
 * (plain UPI or the split), so a payment can be traced back to the real
 * bank/UPI record later. Optional - staff may log the payment before the ID
 * is on hand and add it later.
 */
export function PaymentModeFields({ className }: { className: string }) {
  const [mode, setMode] = useState<'cash' | 'upi' | 'cash_upi'>('cash');
  const showUpiTransactionId = mode === 'upi' || mode === 'cash_upi';

  return (
    <>
      <select
        name="mode"
        value={mode}
        onChange={(e) => setMode(e.target.value as typeof mode)}
        required
        className={className}
      >
        <option value="cash">Cash</option>
        <option value="upi">UPI</option>
        <option value="cash_upi">Cash + UPI (split)</option>
      </select>
      {mode === 'cash_upi' ? (
        <>
          <input
            name="cash_amount"
            type="number"
            step="1"
            min="0"
            placeholder="Cash amount"
            required
            className={className}
          />
          <input
            name="upi_amount"
            type="number"
            step="1"
            min="0"
            placeholder="UPI amount"
            required
            className={className}
          />
        </>
      ) : (
        <input name="amount" type="number" step="1" min="0" placeholder="Amount" required className={className} />
      )}
      {showUpiTransactionId ? (
        <input
          name="upi_transaction_id"
          placeholder="UPI transaction ID (optional)"
          className={className}
        />
      ) : null}
    </>
  );
}
