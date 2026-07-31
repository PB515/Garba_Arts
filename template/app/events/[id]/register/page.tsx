import { notFound } from 'next/navigation';
import { site } from '@/lib/site';
import { HONEYPOT_FIELD } from '@/lib/security';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { submitEventRegistration } from './actions';

const FIELD_CLASS = 'w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export default async function EventRegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const search = await searchParams;

  // Public page - no session, so this reads with the service-role client
  // (read-only lookup, same trusted-server-task justification as the
  // registration write itself).
  const supabase = createServiceRoleClient();
  const { data: event } = await supabase
    .from('events')
    .select('id, name, event_date, description, public_registration_enabled')
    .eq('id', id)
    .maybeSingle();

  if (!event) notFound();

  const boundSubmit = submitEventRegistration.bind(null, id);

  async function action(formData: FormData) {
    'use server';
    const result = await boundSubmit(formData);
    if (result?.error) {
      const { redirect } = await import('next/navigation');
      redirect(`/events/${id}/register?error=${encodeURIComponent(result.error)}`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-2xl font-semibold">{site.name}</h1>
          <p className="text-lg font-medium">{event.name}</p>
          {event.event_date ? <p className="text-sm text-muted">{event.event_date}</p> : null}
          {event.description ? <p className="text-sm text-muted">{event.description}</p> : null}
        </div>

        {!event.public_registration_enabled ? (
          <div className="rounded-[var(--radius)] border border-border p-4 text-center text-sm">
            Registration is not open for this event.
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <input
              type="text"
              name={HONEYPOT_FIELD}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <div className="space-y-1">
              <label htmlFor="registrant_name" className="text-sm font-medium">
                Your full name
              </label>
              <input id="registrant_name" name="registrant_name" required className={FIELD_CLASS} />
            </div>

            <div className="space-y-1">
              <label htmlFor="registrant_phone" className="text-sm font-medium">
                Your phone (optional)
              </label>
              <input id="registrant_phone" name="registrant_phone" className={FIELD_CLASS} />
            </div>

            <div className="space-y-1">
              <label htmlFor="attendee_names" className="text-sm font-medium">
                Anyone coming with you? (one name per line, don&apos;t include yourself)
              </label>
              <textarea id="attendee_names" name="attendee_names" rows={3} className={FIELD_CLASS} />
            </div>

            <div className="space-y-1">
              <label htmlFor="remarks" className="text-sm font-medium">
                Anything else? (optional)
              </label>
              <input id="remarks" name="remarks" className={FIELD_CLASS} />
            </div>

            {search.error && (
              <p role="alert" className="text-sm text-red-600">
                {search.error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
            >
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
