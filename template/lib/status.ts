/**
 * status.ts — the 3-color simplification (replaces the earlier 6-value
 * status). Still free text, not an enforced pipeline (discovery decision
 * #3) — these are just the UI's known values, not a DB constraint.
 */
export const STATUS_OPTIONS = ['follow_up', 'dropped', 'joined'] as const;

export type Status = (typeof STATUS_OPTIONS)[number];

const LABELS: Record<Status, string> = {
  follow_up: 'Ask again',
  dropped: 'Dropped',
  joined: 'Joined',
};

const COLORS: Record<Status, string> = {
  follow_up: '#eab308', // yellow
  dropped: '#dc2626', // red
  joined: '#16a34a', // green
};

export function statusLabel(status: string | null): string {
  if (!status) return 'No status';
  return LABELS[status as Status] ?? status;
}

export function statusColor(status: string | null): string {
  if (!status) return '#9ca3af'; // gray — no status set yet
  return COLORS[status as Status] ?? '#9ca3af';
}
