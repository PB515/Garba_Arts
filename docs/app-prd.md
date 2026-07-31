# App PRD — garba-arts-admin

*Generated per the IDP's "authenticated app" path (`doc-gen-master.md`), scoped down: this build has no public/marketing surface, no competitor research, and no deep-research report, so this PRD is written directly from [`discovery-brief.md`](discovery-brief.md) rather than a Playbook+Research+Brief merge. Companion doc: [`data-model-security.md`](data-model-security.md).*

---

## What this app is

An internal admissions/fees CRM for **The Garba Arts** (2 locations, 6 batches), replacing an Excel sheet. Core team logs inquiries/leads (from WhatsApp, Instagram, referral, or walk-in), tracks demo attendance and enrollment status, records fee payments (cash/UPI, splittable, installment-friendly), and exports/imports CSV for deeper analysis. See `discovery-brief.md` for the full discovery record.

## User roles

**Two roles, revised from the original flat-permission model.** The first live pass shipped with everyone equal; the owner then asked for a real split once the app was actually being used day to day:

- **`super_admin`** (owner + family) — sees every location merged, full CRUD everywhere, the only role that sees combined fee data (`/fees`, CSV export) and events/Navratri admin views.
- **`location_admin`** (tied to exactly one location) — full CRUD (add/edit/archive/permanently-remove) within their own location's students and payments only. Zero access — not even read — to any other location's data. Can see an *individual* student's own fee numbers (that's "not combined"), but not the combined tally.

`has_role()`-style RLS (the IDP's role-based pattern, previously declared "not needed for v1") is now exactly what's in use — `is_super_admin()` / `staff_location_id()`, `SECURITY DEFINER` helpers reading a `staff_roles` table. See `data-model-security.md` for the full policy shape. Role assignment happens only via `tooling/create-account.ts` (service-role) — never through the app itself.

`locations`/`batches`/`events`/`event_registrations`/`event_attendees`/`navratri_registrations` are **not** location-scoped — only `students`/`payments`. The owner explicitly flagged that `events` scoping needs separate verification before deciding either way; don't assume it should follow students without asking, even now that events has its own public-facing surface too.

## Data that must stay private

Layered, not flat, as of the role split:
- **From `anon` (unauthenticated):** everything, no exception in the RLS/grant sense. `/navratri` is the one public *page* (proof-of-concept pass registration, no login), but it writes through a server action using the service-role client, not a direct database grant — `anon` still has **zero** RLS/grant access to any table, including `navratri_registrations`, verified by `verify-denial.ts`.
- **From a `location_admin`, cross-location:** every other location's `students`/`payments`, both read and write — enforced at the RLS level, verified live by `verify-location-denial.ts` (not just trusted from the policy text — signed in as real test accounts and proved it).
- **From a `location_admin`, within their own location:** *combined* fee data specifically — `/fees` and CSV export are super-admin-only routes (app-level check, since RLS alone can't distinguish "your own location's totals" from "everyone's totals" the way it distinguishes locations from each other). An *individual* student's own fee numbers stay visible to that location's admin on the student's own page — only the combined/aggregate view is restricted. Dashboard shows zero money, for anyone, by design — not a role restriction, just not there.

## Delete behavior (confirmed)

Two-tier, both available to every team member:
1. **Soft-delete (archive)** — default delete action. Record is hidden from normal views but recoverable; who/when is logged.
2. **Permanently remove** — a separate, explicit, harder-to-trigger action (its own confirmation step in the UI) that actually deletes the row. Because this touches financial/admissions records, every permanent removal writes an entry to `audit_log` **after** the row is deleted, once the delete has actually succeeded — not before (a real bug during the students build showed a false "deleted" entry when the delete then failed on an FK constraint; the ordering was fixed and this is now the standing rule).

## Core flows

1. **Add inquiry/lead** (Inquiry tab) — the single fastest, most frequent action. Name, phone number, WhatsApp number (if different from the phone), source + a generic optional detail field (which Instagram post, which WhatsApp group, etc. — shown for any source, not just Referral), location (locked to their own for a `location_admin`; batch dropdown stays empty/disabled until a location is picked, since batch names repeat across locations), batch, fee (once decided), a small demo-lecture fee (optional), remarks. Status defaults to `follow_up` — no explicit picker needed at creation.
2. **Reclassify with one click** — three small colored buttons per row in the Inquiry list (🟢 joined / 🟡 ask again / 🔴 dropped), no need to open the detail page just to change an outcome. Built specifically to be fast enough to use while on a call. The green (Joined) button is the one exception — it opens a small confirmation popup naming the student before applying, since converting someone is the one status change worth a deliberate "yes, this is happening" moment; the other two stay instant.
3. **The Inquiry list never loses anyone** — every record ever created stays visible there permanently (a running historical log), regardless of outcome. Marking someone green doesn't remove them from Inquiry — it *also* makes them appear in the Joined list.
4. **Joined tab** — everyone currently `status = joined`, with batch/location and a simple Paid / Not Paid / Half Paid badge (no rupee figures on this shared list — see "Data that must stay private"). A "Complete details" link appears next to anyone still missing batch or fee info.
5. **Update a record** — full edit on the detail page: status, batch/location, fee, demo fee, remarks, real fee/paid/balance numbers.
6. **Log a payment** — mode (cash / UPI / **Cash + UPI**), date, against a specific student. Plain cash/UPI takes one Amount box; Cash + UPI (split, one payment event split across both in one sitting — logged as one entry, not two) takes two boxes, Cash amount and UPI amount, which the app sums for the total. The real split is stored (`cash_amount`/`upi_amount`), not just the combined figure, so the Fees tab can reconcile true totals per mode. Multiple payments accumulate; balance-due is derived, never manually entered.
7. **Dashboard** — lead counts by status (ask-again/joined/dropped), inquiries this period, joined headcount by location/batch. No money at all, for any role.
8. **Fees tab** (super_admin only) — the combined tally (expected/collected/pending, including demo fees); a fixed breakdown (collected by payment mode, by location, by location+batch, always the full dataset) plus filters (location/batch/mode) that narrow the payment log beneath it, not the breakdown; a "Total Cash"/"Total UPI" reconciliation (a Cash+UPI split payment's real cash/UPI amounts counted into each, so the two always sum to Total collected — distinct from the mode breakdown's own "Cash + UPI" row, which counts a split payment's whole amount as logged); and the full payment log across every student.
9. **CSV export** (super_admin only) — full or filtered dataset, for offline analysis.
10. **CSV import** — one-time (or repeatable) load of the existing Excel data, once the file is shared. Columns to be confirmed against the actual file when it arrives — do not assume a format ahead of time.
11. **Event registration, two paths** — staff logs a registration manually (name, phone, fee/paid, attendee names as a one-per-line textarea), **or**, per-event opt-in (`public_registration_enabled`), a real public self-registration page at `/events/[id]/register` (no login) that anyone with the link can use. Both paths capture actual attendee *names*, not just a headcount — the owner's explicit ask: "we don't just want number coming with student but also who are coming, number and name."

## Explicitly out of scope (the No-List)

- Any client, student, or public-facing page — was "none, ever, in this build"; revised twice now, first for `/navratri`, then for opt-in per-event public registration. Still the default for everything else; a new public page is a deliberate exception each time (per-event, off by default), not a pattern to repeat casually.
- Public sign-up / self-registration — accounts are invite-only, created by the core team.
- Flat/role-less permissions — was the v1 default; revised to a real `super_admin`/`location_admin` split once the owner asked for it in real use.
- Enforced status pipeline / state machine — status stays a free tag, now just 3 simplified values instead of the original 6.
- Per-day pass selection for Navratri — explicitly declined; one flat pass per registration for the whole festival.
- GST/invoicing generation — payments are simple line items, not formal invoices.
- Automated follow-up reminders/nudges — declined during discovery; remarks stays free text (and now also carries the "why" behind a dropped lead, instead of more status values).
- Any cinematic/motion craft — Essential tier only, confirmed by the discovery scorecard.

## Build order (security-first, per the IDP's app golden path)

1. Auth (real per-person Supabase accounts, invite-only) →
2. RLS policies (deny-by-default; authenticated-only read/write) →
3. **Prove cross-user denial** — an unauthenticated request must be refused by every table, before any feature is built on top →
4. Features, in order: students/leads CRUD → payments → dashboard → CSV export → events → Navratri proof-of-concept →
5. When the role split arrived: rewrite RLS to location-scope `students`/`payments`, **prove cross-location denial** with real signed-in test accounts (not just trusted from the policy text) → then adjust the UI (nav visibility, locked location fields, restricted routes) on top of the already-proven access boundary, never the other way around.

## Success criteria

No formal conversion/analytics funnel (not a marketing site). Operational success = the team can log a lead in under the time it currently takes in Excel, no fee/payment data is ever ambiguous (balance-due is always correct because it's derived, not typed in), and nothing is lost to concurrent-edit conflicts the way Excel could.

## Open items (still unresolved)

1. Excel import file — pending from the owner; import utility's exact column mapping depends on it.
2. Whether `events`/`event_registrations`/`event_attendees` also need location-scoping — owner said "need to verify first," not yet answered either way, even now that events has its own public surface.
3. Real Navratri dates/prices — explicit placeholders in `lib/navratri-config.ts`, owner said those get decided 1-2 weeks before the actual event.
4. The deferred UPI-payment-screenshot-as-proof feature (needs Supabase Storage — bigger than a quick add-on, its own focused pass).
