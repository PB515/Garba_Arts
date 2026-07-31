/**
 * fee-status.ts — the simple 3-state fee badge for list views (Joined tab,
 * any shared screen). Exact rupee figures stay on the individual student's
 * own detail page only — per the owner's call, money shouldn't appear on
 * shared/list screens, just this simple status.
 */
export type FeeStatus = 'paid' | 'not_paid' | 'half_paid' | 'no_fee_set';

export function feeStatus(feeTotal: number | null, totalPaid: number): FeeStatus {
  if (feeTotal === null || feeTotal <= 0) return 'no_fee_set';
  if (totalPaid <= 0) return 'not_paid';
  if (totalPaid >= feeTotal) return 'paid';
  return 'half_paid';
}

const LABELS: Record<FeeStatus, string> = {
  paid: 'Paid',
  not_paid: 'Not paid',
  half_paid: 'Half paid',
  no_fee_set: '-',
};

const COLORS: Record<FeeStatus, string> = {
  paid: '#16a34a',
  not_paid: '#dc2626',
  half_paid: '#eab308',
  no_fee_set: '#9ca3af',
};

export function feeStatusLabel(status: FeeStatus): string {
  return LABELS[status];
}

export function feeStatusColor(status: FeeStatus): string {
  return COLORS[status];
}
