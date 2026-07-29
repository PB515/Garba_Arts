# Module — Adapter Boundary (Tier-2 #11)

*Every external service hides behind an interface the app owns. Call sites depend on the interface; the provider lives in one swappable file. Validated on Bugadi — two payment pivots made trivial.*

## The rule

For any external service (payments, shipping, email, SMS, storage, analytics):

1. Define an **interface** the app needs — `lib/integrations/<service>/index.ts`.
2. Implement one **adapter per provider** — `lib/integrations/<service>/<provider>.ts`.
3. A **factory** picks the adapter from env (`PAYMENTS_PROVIDER`, `SHIPPING_PROVIDER`, …).
4. Call sites import the factory + interface — **never** a provider SDK directly.

Switching providers = a new adapter file + an env change. No call site moves.

## Shipped boundaries

| Service | Boundary | Stub adapter |
|---|---|---|
| Payments | `lib/integrations/payments/index.ts` | `razorpay.ts` (signature verify is real; `createOrder` needs the SDK) |
| Shipping | `lib/integrations/shipping/index.ts` | `shiprocket.ts` (rates/label/track stubs) |

Both adapters `import 'server-only'` — provider secrets never reach the browser.

## Discipline

- **Keep all provider HTTP/SDK calls inside the adapter.** If a provider type leaks into a component, the boundary is broken.
- **Adapters are server-only.** Secrets (`*_KEY_SECRET`) stay server-side (Safety Rail 2; `env-validate` enforces no secret-shaped `NEXT_PUBLIC_`).
- **Payment webhooks must be idempotent** — dedupe by payment id with `lib/logic/idempotency.ts` before crediting an order (Bugadi must-hold).
- **Tax is not a payment concern** — GST lives in `lib/logic/tax.ts`, computed before you create the order.

## The general principle — why one stack, and where it isn't one

*Raised directly in a 2026-07 session: "why are we stuck on one tech stack?" Answered here so it survives past that conversation.*

The IDP's shared 80% (`template/`, `tooling/`) is deliberately **single-stack** — Next.js, Supabase, Node/TypeScript, nothing else — not because other stacks are worse, but because that sameness is *the entire mechanism* that makes cross-site reuse possible. `tooling/migrate.ts`, the 4-client Supabase split, the `elements/` React component library, and most of the skills all assume this stack. If site #3 used a different backend, none of that would transfer, and the IDP would stop being a factory and go back to being a from-scratch build every time. That standardization is a trade-off made on purpose, not an accident of habit.

**That doesn't mean every feature is locked to it.** This adapter-boundary pattern generalizes past payments/shipping: for anything where a different language or runtime is genuinely the right tool — a Python data-processing job, a Rust CLI, a Go worker, a queue-driven microservice — the same rule applies. Define the interface the app needs, implement it as a call to that other service (HTTP, webhook, queue, subprocess), and keep the call site ignorant of what's on the other side. The core app stays on the shared stack; the *specific feature* doesn't have to.

**How to tell the difference between "this needs a real adapter" and "this is just picking a second tool in the same runtime":** adding a second JS/TS library that runs in the same Next.js frontend (e.g. GSAP alongside Motion — see `docs/skills-sop.md`) isn't a stack decision at all, no language boundary is crossed, no adapter is needed. It only becomes a polyglot-boundary question when a different *language or runtime* is involved.
