# Golden paths — per-type build recipes

*The convergent path for each site structural type: phase order, the docs/patterns/modules/skills it pulls in, and the gotchas from the build it came from. Pick the closest match and adapt. (Coverage-roadmap index, Tier-2 #9/#10.)*

| Recipe | Use when | Auth? | Source build |
|---|---|---|---|
| [`ecommerce.md`](ecommerce.md) | Sells products with stock, tax, fulfilment | admin only | Bugadi.co |
| [`portal.md`](portal.md) | Accounts + private per-user data | **yes (PART 7)** | Patel CA, Inspire, Purven |
| [`portfolio.md`](portfolio.md) | Identity-led personal brand, light CMS | optional CMS | Purven |
| [`marketing.md`](marketing.md) | Inform + convert, lead capture | usually none | Patel CA, Inspire |

## How to use a recipe

1. Match your site to the closest type (a site can blend — e.g. marketing + portal).
2. Follow its phase order; it already sequences security-first where auth is involved.
3. It names the `lib/logic`, `lib/integrations`, patterns, modules, and skills to pull in — so you're not deciding from scratch.
4. Read the gotchas first — they're the mistakes that already happened on the source build.

## Coverage

These four span the shipped builds. A new type that doesn't fit (e.g. a booking platform, a community) → build it, then add a recipe here from what you learned (the retro → backlog → golden-path loop). Don't pre-write recipes for types no one has built — that's speculative (charter §8).
