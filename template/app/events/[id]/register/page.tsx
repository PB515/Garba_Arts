import { notFound } from 'next/navigation';
import { Fraunces, Karla, Space_Mono } from 'next/font/google';
import { HONEYPOT_FIELD } from '@/lib/security';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { submitEventRegistration } from './actions';
import { AttendeeRows } from '../../attendee-rows';
import { SubmitButton } from '@/lib/patterns/submit-button';
import './poster.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-poster-display',
});
const karla = Karla({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-poster-body' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-poster-mono' });

function formatEventDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * A diya (oil lamp) line icon — the fallback when an event has no uploaded
 * banner, so the poster still looks intentional rather than an empty circle.
 */
function DiyaIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 40c0 8 8 14 18 14s18-6 18-14" />
      <path d="M8 40h48" />
      <path d="M32 34c3-6-1-10-1-10s-4 4-1 10" />
      <circle cx="32" cy="18" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
    .select('id, name, event_date, description, public_registration_enabled, banner_image_url')
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

  const dateLabel = formatEventDate(event.event_date);

  return (
    <div className={`poster ${fraunces.variable} ${karla.variable} ${spaceMono.variable}`}>
      <p className="poster-eyebrow">The Garba Arts presents</p>
      <h1 className="poster-title">{event.name}</h1>

      <div className="poster-portrait">
        <div className="poster-portrait-ring" aria-hidden="true" />
        <div className="poster-portrait-frame">
          {event.banner_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.banner_image_url} alt="" className="poster-banner-img" />
          ) : (
            <div className="poster-banner-fallback">
              <DiyaIcon />
            </div>
          )}
        </div>
      </div>

      {dateLabel ? <p className="poster-ticket">{dateLabel}</p> : null}

      {event.description ? <p className="poster-description">{event.description}</p> : null}

      <div className="poster-card">
        {!event.public_registration_enabled ? (
          <p className="poster-closed">Registration is not open for this event.</p>
        ) : (
          <form action={action} className="poster-form">
            <input
              type="text"
              name={HONEYPOT_FIELD}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <label className="poster-field" htmlFor="registrant_name">
              Your full name
              <input id="registrant_name" name="registrant_name" required className="poster-input" />
            </label>

            <label className="poster-field" htmlFor="registrant_phone">
              Your phone (optional)
              <input id="registrant_phone" name="registrant_phone" className="poster-input" />
            </label>

            <AttendeeRows fieldClass="poster-input" />

            <label className="poster-field" htmlFor="remarks">
              Anything else? (optional)
              <input id="remarks" name="remarks" className="poster-input" />
            </label>

            {search.error && (
              <p role="alert" className="poster-error">
                {search.error}
              </p>
            )}

            <SubmitButton className="poster-submit">Register</SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
