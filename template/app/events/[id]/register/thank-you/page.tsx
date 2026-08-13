import { Fraunces, Karla } from 'next/font/google';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import '../poster.css';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-poster-display' });
const karla = Karla({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-poster-body' });

/**
 * Redesigned thank-you page (decision #90): a full-size banner of the event
 * just registered for, plus a gallery of past events. Gallery is auto-pulled
 * (past date + has a banner + not opted out via events.show_in_gallery) -
 * "pull automatically or give option while creating event" resolved as
 * both: automatic by default, with a per-event opt-out the admin can flip.
 * The "promotional content" half of this item is deliberately not built -
 * still needs the owner's own answer for what that actually means
 * (docs/pending-feedback.md item #6).
 */
export default async function EventRegisterThankYouPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: event } = await supabase.from('events').select('name, banner_image_url').eq('id', id).maybeSingle();

  const today = new Date().toISOString().slice(0, 10);
  const { data: pastEvents } = await supabase
    .from('events')
    .select('id, name, banner_image_url, event_date')
    .neq('id', id)
    .not('banner_image_url', 'is', null)
    .eq('show_in_gallery', true)
    .lt('event_date', today)
    .order('event_date', { ascending: false })
    .limit(6);

  return (
    <div className={`poster ${fraunces.variable} ${karla.variable}`} style={{ minHeight: '100vh' }}>
      <p className="poster-eyebrow">The Garba Arts</p>
      <h1 className="poster-thankyou-title">Thank you!</h1>
      <p className="poster-thankyou-body">
        Your registration{event?.name ? ` for ${event.name}` : ''} has been recorded. See you there!
      </p>

      {event?.banner_image_url ? (
        <div className="poster-thankyou-banner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.banner_image_url} alt="" />
        </div>
      ) : null}

      {pastEvents?.length ? (
        <div className="poster-gallery">
          <p className="poster-gallery-title">More from The Garba Arts</p>
          <div className="poster-gallery-grid">
            {pastEvents.map((e) => (
              <div key={e.id} className="poster-gallery-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.banner_image_url ?? ''} alt="" />
                <span>{e.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
