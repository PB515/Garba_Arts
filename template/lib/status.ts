/**
 * status.ts — the starter status tag list for students/leads.
 *
 * NOT an enforced pipeline (discovery decision #3): a record can be created
 * or moved to any of these at any time, in any order. This list only drives
 * the dropdown/filter UI so entries stay consistent — it is not a state
 * machine and nothing here blocks a transition.
 *
 * This starter set is unconfirmed with the owner (docs/app-prd.md open
 * item #4) — add/rename values here if the real workflow needs different
 * ones; nothing else in the app depends on the exact set.
 */
export const STATUS_OPTIONS = [
  'inquiry',
  'demo_scheduled',
  'demo_done',
  'joined',
  'not_interested',
  'dropped',
] as const;

export type Status = (typeof STATUS_OPTIONS)[number];

const LABELS: Record<Status, string> = {
  inquiry: 'Inquiry',
  demo_scheduled: 'Demo scheduled',
  demo_done: 'Demo done',
  joined: 'Joined',
  not_interested: 'Not interested',
  dropped: 'Dropped',
};

export function statusLabel(status: string | null): string {
  if (!status) return 'No status';
  return LABELS[status as Status] ?? status;
}
