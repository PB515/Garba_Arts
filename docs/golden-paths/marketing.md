# Golden Path — Marketing / Lead-Gen

*Content + conversion + forms. Source: Patel CA marketing site, Inspire Academy marketing + ops.*

**Use when:** the site's job is to inform and convert — services, about, contact/lead capture — often with no login.

## Phase order

```
0. Setup + tokens + Business Brief (the substance that stops placeholder sites) + 03b approval
1. Static pages — home, services (instance-level, one hero per service), about, contact
   · mostly static-in-code content; real copy from the Brief, never fabricated
2. Lead form — honeypot + rate-limit (lib/security) → save to DB → email; spam-protected
3. Runtime features (if any — a feed, a hub) — loading(timeout)/empty/failed fallbacks
4. Analytics — choose cookieless / GA4 / both; consent-gated if GA4; instrument BEFORE launch
5. SEO + polish — rendered <title> per page type (not doubled), meta/OG/schema, 360px
6. Deploy + live smoke test (form saves + email arrives on the DEPLOYED url)
```

## Pulls in

- `lib/security` (honeypot + rate-limit) for every public form
- Patterns: `empty-state`; `audit-log` if leads are managed
- Modules: `anti-ai-look`; `content-model` (mostly static-in-code)
- Gates: mobile/theme gate; the deploy + smoke-test runbook

## Gotchas (from Patel CA / Inspire)

- **The Business Brief is what stops placeholder sites** — research says what competitors do; the Brief says who THIS business is.
- **Instrument analytics before launch** — you can't measure the first weeks retroactively.
- **Privacy policy must match deployed analytics** — and the rendered `<title>` must not double the firm name.
- **No-List discipline** — split "never" vs "phase 2+"; Inspire's "no portal" got reversed mid-build (see `docs/gates.md`).
