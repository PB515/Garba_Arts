# Toolkit Retrospective — building Bugadi.co

*A field report from one real, end-to-end build (Bugadi.co — an Indian oxidised-jewellery e-commerce store + full admin/OMS) produced with the toolkit. Written to feed back into toolkit development: **what helped, what was missing, and the concrete lessons** that should shape the next version.*

---

## 0. Context — what got built with the toolkit

In a single continuous engagement the toolkit carried a project from zero to a deployed, multi-feature production app:

- **Storefront** (Next.js + Tailwind tokens + Supabase + Vercel): catalog, PDP "Wearable Heritage" pages, variant picker, cart, WhatsApp checkout, Instagram showcase.
- **Admin / OMS-CRM**: products, variants + stock-movement ledger, manual/draft/marketplace orders, customers/CRM, categories, collections, merchandising, homepage CMS, tax settings, invoices, returns, audit log, launch readiness.
- **Commerce internals**: place-of-supply GST engine, GST-vs-unregistered tax mode, snapshot-on-invoice, idempotent payment confirm, adapter boundaries for Razorpay/Shiprocket/Instagram.
- **12 database migrations** (0001–0012), all applied to a shared Supabase DB and verified live, then rolled back.

That breadth in one run is itself the headline result: **the toolkit's structure is what made a solo build of this size tractable.** The rest of this report is the honest detail.

---

## 1. What the toolkit did well

### 1.1 The context anchor (`CLAUDE.md`) was the single highest-leverage artifact
Auto-loading a project file every session — with a live **"Current status"** block, frozen **conventions**, and **"decisions made (do not revisit)"** — meant work resumed instantly even **across a context compaction mid-project**. When the session compacted, recovery leaned entirely on `CLAUDE.md` + the build log and lost almost nothing. This is the toolkit's best idea; keep it central.

### 1.2 Migration-before-deploy discipline kept production safe 12 times
The loop — *write migration → human runs SQL on the shared DB → verify against real data → push code* — never once broke production despite 12 schema changes landing on a database that local and prod **share**. The ordering rule ("merging code before the column exists would break prod") was followed mechanically and paid off every time.

### 1.3 Bucket → Slice decomposition made big features shippable
Huge scopes (a full OMS; an entire catalog/merchandising system) were cut into **slices that each had their own migration, build, verify, and deploy**. Examples that worked cleanly:
- OMS split into Slice 1 (CRM) / Slice 2 (variants + ledger + manual orders) / Slice 3 (storefront variant picker).
- Catalog split into Categories → Collections → product×category merchandising → homepage CMS.

Each slice was independently testable and reversible. This is the right unit of work; the toolkit should make it the default.

### 1.4 Adapter boundaries paid off under change
Keeping all Razorpay/Shiprocket/Instagram calls behind single modules made two pivots trivial:
- **"Mock payment now, real Razorpay later"** — swapped behind one interface.
- **"Replace online checkout with WhatsApp ordering"** — the online pipeline was left intact and just *unlinked*, ready to switch back on.

### 1.5 Verify-then-rollback gave real confidence without polluting data
The pattern of **placing genuine orders / inserting real rows / flipping live settings, verifying end-to-end, then scripting a clean rollback** produced trustworthy proof (e.g. "BUG-10009 stored the Gold variant + ₹599 snapshot, stock 8→7, ledger logged, then deleted"). It caught real behavior, not mocks.

### 1.6 Security-first ordering and tokens-only design held up
- "auth → RLS → **prove logged-out/cross-user denial** → then features" produced a deny-by-default system with the denial gate actually demonstrated.
- "tokens only, no hardcoded hex" kept the storefront visually consistent across dozens of new surfaces.
- The taste-skill kept the storefront from reading as templated/AI-generated.

### 1.7 The build log (doc 09) was the audit trail that made all of the above legible
One line per significant change, with **BROKE/reverted lines called out**, meant any surprising state could be traced to its cause. It doubled as the session-handoff contract.

---

## 2. What was lacking — friction that cost real time

These are the places the toolkit left me improvising. Each is a concrete, repeatable cost.

### 2.1 Migrations are applied by hand — the biggest recurring handoff
Every one of 12 migrations required me to **paste SQL into the chat and wait for the human to run it in the Supabase SQL editor**. There is no `migrate up`, no migration-status check, and **no down-migrations**. This is the single most frequent point of latency and human dependency in the whole workflow.

### 2.2 Verification was decoupled from prod only by manual scripts
Because **local and production share one database**, every functional check touched live data and had to be undone with a **hand-written one-off Node script** (env-parsing + service-role client + insert + verify + delete — rebuilt from scratch each time, then deleted). There is no seed/teardown, no ephemeral test DB, no reusable ops harness.

### 2.3 There is no automated test suite
All verification was **manual** — browser clicks + DB scripts — and **re-done by hand every slice**. The highest-risk logic (the **GST place-of-supply engine**, the **stock-movement ledger**, **order idempotency**, **tax-mode snapshotting**) is pure and trivially unit-testable, yet nothing guards it against regression. A 50-line test file would have replaced hours of manual re-checking.

### 2.4 Running `build` while `dev` was live corrupted `.next` — repeatedly
`npm run build` and `next dev` writing to the same `.next` directory **broke the dev server multiple times** (404s, viewport 0×0, garbage titles), each costing a kill/clean/restart cycle. The toolkit gives no guard against this very common footgun.

### 2.5 The browser-verification tooling was flaky
`executeScript`-based reads (`read_page`, `find`, `screenshot`) intermittently **timed out at 45s ("document_idle never settles")** or returned `viewport 0×0`, especially against the dev server's open HMR connection. Visual verification was unreliable; I frequently fell back to `get_page_text` or fetching server HTML. The design-feedback loop never closed cleanly.

### 2.6 Secrets/config handling produced two real incidents
- A **service-role key got pasted into `NEXT_PUBLIC_SUPABASE_ANON_KEY`** (secret exposed to the browser) — caught only by observed RLS behavior, then required a key rotation.
- A **truncated token paste** ("Unregistered API key") broke prod admin login until re-pasted.

There is no boot-time env validation (e.g. "a `NEXT_PUBLIC_*` var must not look like a secret", "validate key prefixes/lengths").

### 2.7 Cross-cutting values weren't centralized from day 0
The **"Bugadi" → "Bugadi.co" rebrand** meant hunting the name across ~12 files. The brand/contact constants (`lib/site.ts`) were only introduced *late*, reactively. Had the scaffold shipped a single source of truth for brand, contact, and social from the start, the rebrand would have been one line.

### 2.8 Type friction around the data layer
Recurring TS papercuts: **server-action return-union narrowing** (`r.error` typed `string | undefined`) and **indexing Supabase rows by string key** (`any` casts). No generated Supabase types were wired in, so the data layer leaned on `any` and hand-written row interfaces.

### 2.9 Windows line-ending noise
Every commit emitted `LF will be replaced by CRLF` warnings — no `.gitattributes` in the scaffold.

---

## 3. Lessons → concrete toolkit changes

Prioritized by impact-to-effort, drawn directly from the friction above.

### Tier 1 — highest leverage
1. **Ship a migration runner.** `migrate up/status/down` (or wrap the Supabase CLI) so schema changes apply without a human paste step, with status checking and **reversible down-migrations**. This removes the #1 recurring latency.
2. **Provide a verification harness as a first-class tool.** A pre-wired module exposing the service-role client + `seed()` / `snapshot()` / `teardown()` helpers, so functional checks aren't rebuilt as throwaway scripts each time. Bundle a robust headless-browser checker (Playwright with proper waits) so visual verification stops being flaky.
3. **Separate test data from prod.** A local/ephemeral DB (or a per-run schema) with seed + teardown so verification never touches production. This is the root cause behind both §2.2 and a lot of §2.5.
4. **Scaffold a minimal test suite for the risky pure logic.** Pre-write unit tests for the tax engine, stock ledger, and idempotency the moment those modules exist. Cheapest possible regression insurance.

### Tier 2 — remove footguns
5. **Guard dev/build concurrency** — detect a running `dev` server before `build`, or point them at different output dirs. (§2.4)
6. **Boot-time env validation** — assert no `NEXT_PUBLIC_*` var is secret-shaped, validate key prefixes/lengths, fail loud on missing required vars. Would have prevented both §2.6 incidents.
7. **Generate Supabase types into the repo** and have the data-layer pattern consume them, killing the `any` casts and the narrowing dance. (§2.8)
8. **`.gitattributes` in the scaffold** (`* text=auto eol=lf`). One line, ends §2.9.

### Tier 3 — bake in the patterns that already worked
9. **Centralize brand/config/contact constants from the scaffold** (`lib/site.ts` on day 0), so rebrands and contact changes are single-edit. (§2.7)
10. **Formalize the `CLAUDE.md` "Current status" + build-log as the session-handoff template** — they're the reason a mid-project compaction cost nothing. Make them mandatory scaffold artifacts with a fixed shape.
11. **Make "bucket → slice → migration → verify-rollback → deploy" the default workflow the toolkit guides you through**, not a convention you have to remember.
12. **Standardize the adapter boundary** as a scaffolded folder (`lib/integrations/*`) with a stub interface, since every external service (payments, shipping, social) benefited from it.

---

## 4. Scorecard

| Area | Verdict | Note |
|---|---|---|
| Project structure (buckets/slices) | **Strong** | The reason a build this large was tractable solo. |
| Context anchor + build log | **Strong** | Survived a compaction with ~zero loss. |
| Migration *safety* (ordering) | **Strong** | 12 migrations, prod never broke. |
| Migration *ergonomics* (manual apply) | **Weak** | Biggest recurring latency; no down-migrations. |
| Adapter boundaries | **Strong** | Made two pivots trivial. |
| Design system (tokens + taste-skill) | **Strong** | Consistent, non-templated storefront. |
| Verification / testing | **Weak** | All manual; no suite; throwaway scripts; flaky browser. |
| Local dev robustness | **Weak** | build-vs-dev corruption; CRLF noise. |
| Secrets/config hygiene | **Mixed** | Right rules, but two real incidents; no validation. |
| Data-layer typing | **Mixed** | Worked, but leaned on `any`; no generated types. |

**One-line takeaway:** *the toolkit's **process and structure** are its strength (and should be hardened into defaults); its **gaps are all in the inner loop** — migrations, testing, verification, and local-dev robustness — which is exactly where the next version should invest.*

---

*Generated from the Bugadi.co build. Pair this with `docs/09-build-log.md` (the change-by-change record) for the supporting detail behind every claim here.*
