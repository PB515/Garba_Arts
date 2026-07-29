/**
 * site.ts — brand & contact constants, set ONCE per site.
 *
 * Use when: anywhere you'd otherwise hardcode the business name, a phone number,
 * an email, or a social URL. Edit this file (and the tokens in globals.css) and
 * the whole site updates — the gap that forced a multi-file rebrand on Bugadi.
 *
 * This is the per-site 20%: replace every value below when you clone.
 */
export const site = {
  name: 'Acme Co',
  legalName: 'Acme Private Limited',
  tagline: 'Replace this tagline per site.',
  description: 'One-sentence description used as the default <meta> description.',

  url: 'https://example.com', // production URL — canonical/sitemap/OG depend on it

  contact: {
    email: 'hello@example.com',
    phone: '+91 00000 00000',
    // wa.me uses digits only, no +, spaces, or dashes (Safety Rail: check this link live)
    whatsapp: '910000000000',
    address: 'Street, City, State, PIN',
  },

  social: {
    instagram: '',
    linkedin: '',
    x: '',
  },
} as const;

export type Site = typeof site;
