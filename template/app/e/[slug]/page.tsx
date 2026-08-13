import { notFound, redirect } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

/**
 * The short public event link (0032/decision #85) - e.g. /e/garba-night-2026
 * instead of /events/<uuid>/register. Deliberately just a lookup + redirect
 * to the existing canonical poster page rather than a duplicate render: it's
 * the lower-risk way to satisfy "resolves to the same poster page" without
 * touching the working /events/[id]/register page at all. Public route, no
 * session - same service-role lookup pattern as the register page itself.
 */
export default async function ShortEventLinkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = createServiceRoleClient();
  const { data: event } = await supabase.from('events').select('id').eq('slug', slug).maybeSingle();

  if (!event) notFound();

  redirect(`/events/${event.id}/register`);
}
