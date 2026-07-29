/**
 * empty-state — use when a list, table, or section has no rows yet.
 *
 * The Polish-bar rail requires real empty states (not a blank screen). This is a
 * presentational, server-renderable component: icon + title + message + an
 * optional action (pass a <Link>/<button> as `action`).
 */
import type { ReactNode } from 'react';
import type { LucideIcon } from '../icons';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
      {Icon ? <Icon className="size-8 opacity-40" aria-hidden /> : null}
      <h3 className="text-base font-medium">{title}</h3>
      {message ? <p className="max-w-sm text-sm opacity-70">{message}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
