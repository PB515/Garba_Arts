/**
 * form.ts — small helpers shared by every server action that reads a plain
 * <form> submission: get the authenticated user (or throw), and pull
 * trimmed string / parsed number fields out of FormData.
 */
import { createClient } from '@/lib/supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return { supabase, user };
}

export function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length ? s : null;
}

export function num(formData: FormData, key: string): number | null {
  const s = str(formData, key);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Builds a safe `ilike` value for PostgREST's `.or()` filter string. A raw
 * search term containing a comma or parenthesis (e.g. "Patel, R") breaks the
 * filter's own syntax - found live when a comma in the Inquiry search box
 * crashed the whole page with a raw "failed to parse logic tree" error.
 * PostgREST's escape hatch: wrap the value in double quotes when it contains
 * a reserved character, backslash-escaping any literal backslash/quote.
 */
export function orIlikeValue(term: string): string {
  const value = `%${term}%`;
  if (/[,.():"]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

/** Builds a `?a=1&b=2` query string, skipping empty/undefined values - used to carry a page's current filters into its CSV export link. */
export function buildQueryString(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) usp.set(key, value);
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

/**
 * A wa.me link for the quick-message button on Lead and Inquiry. WhatsApp
 * number takes priority over the plain phone number when both exist -
 * that's literally what the field is for. Numbers are stored as plain
 * 10-digit Indian mobile numbers with no country code (no format
 * validation on this field, decision from Phase 3), so `91` is prepended
 * here; a leading 0 (sometimes typed out of landline habit) is stripped
 * first since wa.me needs the number without one.
 *
 * `?text=` pre-fills WhatsApp's own compose box - staff can still edit it
 * before sending, this just saves retyping the same opener every time. Not
 * a substitute for a real message: wa.me has no way to pre-attach media at
 * all (a hard limitation on WhatsApp's side, not something buildable
 * around without the separate, much heavier WhatsApp Business Platform).
 *
 * `message` is a fully-formed string (already run through fillTemplate) -
 * this function only handles the phone-number/URL half.
 */
export function whatsappLink(phone: string | null, whatsapp: string | null, message?: string): string | null {
  const raw = (whatsapp || phone)?.replace(/[^\d]/g, '');
  if (!raw) return null;
  const digits = raw.replace(/^0+/, '');
  if (!digits) return null;
  const withCountryCode = digits.startsWith('91') ? digits : `91${digits}`;
  return `https://wa.me/${withCountryCode}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

/** Substitutes {name} in a message template (0027) - the one placeholder these support today. */
export function fillTemplate(body: string, name: string): string {
  return body.replaceAll('{name}', name);
}

/**
 * Substitutes {name}/{event_name}/{event_date}/{venue} in an event broadcast
 * (0034/decision #87) - a superset of fillTemplate's single {name}
 * placeholder, kept as its own function rather than widening fillTemplate's
 * signature so Lead/Inquiry's existing calls (still just {name}) stay
 * untouched. The event-level values (name/date/venue) are the same for
 * every registrant of one broadcast; only `name` varies per row.
 */
export function fillEventTemplate(
  body: string,
  vars: { name: string; eventName: string; eventDate: string; venue: string },
): string {
  return body
    .replaceAll('{name}', vars.name)
    .replaceAll('{event_name}', vars.eventName)
    .replaceAll('{event_date}', vars.eventDate)
    .replaceAll('{venue}', vars.venue);
}

/** Kebab-cases an event name into a URL-safe base for the short /e/[slug] link (0032). Collision handling (an incrementing -2/-3 suffix) lives in events/actions.ts, next to the insert it protects. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'event';
}

export interface AttendeeInput {
  name: string;
  phone: string | null;
  whatsapp: string | null;
}

/**
 * Reads dynamic attendee rows (name/phone/WhatsApp triples) produced by the
 * AttendeeRows client component - name+phone+whatsapp_{i} fields, count
 * given by attendee_count. Replaces the old one-name-per-line textarea
 * parser: a name-only list can't capture phone/WhatsApp per attendee, which
 * the owner asked for directly ("name and whatsapp number"). Name is
 * required per row (a row with no name is dropped); phone/WhatsApp stay
 * optional, same as the registrant's own phone field.
 */
export function parseAttendeeRows(formData: FormData): AttendeeInput[] {
  const count = num(formData, 'attendee_count') ?? 0;
  const rows: AttendeeInput[] = [];
  for (let i = 0; i < count; i++) {
    const name = str(formData, `attendee_name_${i}`);
    if (!name) continue;
    rows.push({
      name,
      phone: str(formData, `attendee_phone_${i}`),
      whatsapp: str(formData, `attendee_whatsapp_${i}`),
    });
  }
  return rows;
}
