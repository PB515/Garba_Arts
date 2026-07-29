/**
 * security.ts — form anti-spam primitives (honeypot + rate limit).
 *
 * Use when: handling ANY public form submission (contact, lead, signup). Pair
 * both: the honeypot catches dumb bots, the rate limit catches floods. Validated
 * as a build requirement + launch gate across the builds.
 */

/**
 * Honeypot — a hidden field a human never fills but a bot does.
 * Render an off-screen input named by `HONEYPOT_FIELD`, then on the server:
 *   if (failsHoneypot(formData.get(HONEYPOT_FIELD))) return silentlyDrop();
 */
export const HONEYPOT_FIELD = 'company_website';

export function failsHoneypot(value: FormDataEntryValue | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Rate limit — a tiny in-memory fixed-window limiter, keyed by IP (or any id).
 * Use when: you need a cheap per-instance guard with no extra infra. For
 * multi-instance/serverless production, back it with Upstash/Redis instead —
 * this resets per process. Good enough to stop a single-source flood.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
  now = Date.now()
): RateLimitResult {
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }
  b.count += 1;
  return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count), resetAt: b.resetAt };
}

/** Best-effort client IP from a request's forwarded headers. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
