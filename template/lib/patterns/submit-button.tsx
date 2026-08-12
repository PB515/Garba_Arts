'use client';
/**
 * SubmitButton — disables itself while its parent <form>'s action is in
 * flight. Found live: the plain "Add" button had no loading feedback, so on
 * a slow connection a second tap (assuming the first didn't register) fired
 * a genuine second insert - not a framework bug, just nothing stopping a
 * real double-submit. `useFormStatus` only works as a child of the <form>
 * it reports on, hence its own small component rather than inline state.
 * Originally lived under app/students/ (where the bug was first found);
 * moved here (decision #80) once the owner asked for the same protection on
 * every submit button site-wide, not just the students forms.
 */
import { useFormStatus } from 'react-dom';

export function SubmitButton({
  children,
  pendingLabel = 'Saving…',
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
