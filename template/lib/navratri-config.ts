/**
 * navratri-config.ts — pricing tiers for the Navratri pass proof of concept.
 *
 * ⚠ PLACEHOLDER VALUES — the owner said the real dates/prices won't be
 * decided until 1-2 weeks before Navratri. Replace these before the real
 * launch; this file exists so the flow (early-bird price -> standard price
 * -> closed) is provable end to end without the real numbers yet.
 */
export const NAVRATRI_CONFIG = {
  earlyBirdPrice: 500, // PLACEHOLDER
  standardPrice: 600, // PLACEHOLDER
  // After this instant, price jumps from earlyBirdPrice to standardPrice.
  priceJumpAt: '2026-10-01T00:00:00+05:30', // PLACEHOLDER
  // After this instant, registration closes entirely.
  registrationClosesAt: '2026-10-10T23:59:59+05:30', // PLACEHOLDER
} as const;

export type NavratriTier =
  | { status: 'early_bird'; pricePerPass: number }
  | { status: 'standard'; pricePerPass: number }
  | { status: 'closed' };

export function currentNavratriTier(now: Date = new Date()): NavratriTier {
  if (now >= new Date(NAVRATRI_CONFIG.registrationClosesAt)) {
    return { status: 'closed' };
  }
  if (now >= new Date(NAVRATRI_CONFIG.priceJumpAt)) {
    return { status: 'standard', pricePerPass: NAVRATRI_CONFIG.standardPrice };
  }
  return { status: 'early_bird', pricePerPass: NAVRATRI_CONFIG.earlyBirdPrice };
}
