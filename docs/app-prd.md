# App PRD — garba-arts-admin

*Generated per the IDP's "authenticated app" path (`doc-gen-master.md`), scoped down: this build has no public/marketing surface, no competitor research, and no deep-research report, so this PRD is written directly from [`discovery-brief.md`](discovery-brief.md) rather than a Playbook+Research+Brief merge. Companion doc: [`data-model-security.md`](data-model-security.md).*

---

## What this app is

An internal admissions/fees CRM for **The Garba Arts** (2 locations, 6 batches), replacing an Excel sheet. Core team logs inquiries/leads (from WhatsApp, Instagram, referral, or walk-in), tracks demo attendance and enrollment status, records fee payments (cash/UPI, splittable, installment-friendly), and exports/imports CSV for deeper analysis. See `discovery-brief.md` for the full discovery record.

## User roles

**One role: core team member.** Confirmed explicitly — permissions are flat across all 5–8 team members, including delete. There is no owner/staff split, no admin tier, and no client/student role of any kind — this app has zero non-staff users.

Every team member, once logged in, can:
- View, add, and edit any student/lead record
- View, add, and edit any payment entry
- Soft-delete (archive) any record
- Permanently remove any record (a separate, explicit action from soft-delete — see below)
- View the dashboard
- Export CSV
- Run the CSV import utility (once the source Excel file is available)

No feature is hidden or restricted between team members. `has_role()`-style RLS (the IDP's role-based pattern) is **not needed for v1** — plain "is this user authenticated" RLS is sufficient given flat permissions. If a role split is ever wanted later (e.g. an owner-only financial view), that's a deliberate, logged re-opening of this decision, not a default to build toward now.

## Data that must stay private

**Everything except one deliberate exception.** `/navratri` is a proof-of-concept public pass-registration page (no login) — the owner explicitly asked for it after event registration turned out to be admin-entered instead. It writes through a server action that computes the price server-side, not a direct database grant; `anon` still gets **zero** RLS/grant access to any table, including `navratri_registrations` — verified by `verify-denial.ts`. Every other surface in this system stays authenticated-core-team-only, no anonymous read access anywhere.

## Delete behavior (confirmed)

Two-tier, both available to every team member:
1. **Soft-delete (archive)** — default delete action. Record is hidden from normal views but recoverable; who/when is logged.
2. **Permanently remove** — a separate, explicit, harder-to-trigger action (its own confirmation step in the UI) that actually deletes the row. Because this touches financial/admissions records, every permanent removal writes an entry to `audit_log` **after** the row is deleted, once the delete has actually succeeded — not before (a real bug during the students build showed a false "deleted" entry when the delete then failed on an FK constraint; the ordering was fixed and this is now the standing rule).

## Core flows

1. **Add inquiry/lead** — the single fastest, most frequent action. Name, phone number, source, location, batch, status (free-tag, no enforced sequence), remarks. Fee/payment fields are optional at creation — a lead isn't necessarily paying anything yet.
2. **Update a record** — change status, reassign batch/location, edit remarks, add a payment.
3. **Log a payment** — amount, mode (cash/UPI), date, against a specific student. Multiple payments accumulate; balance-due is derived, never manually entered.
4. **Dashboard** — inquiries this period, demo→joined conversion, headcount per batch/location, total collected/pending, at a glance.
5. **Search/filter table** — e.g. "Batch 3, unpaid," across all fields.
6. **CSV export** — full or filtered dataset, for offline analysis.
7. **CSV import** — one-time (or repeatable) load of the existing Excel data, once the file is shared. Columns to be confirmed against the actual file when it arrives — do not assume a format ahead of time.

## Explicitly out of scope (the No-List)

- Any client, student, or public-facing page — was "none, ever, in this build"; revised when the owner explicitly asked for `/navratri` as a public proof-of-concept. Still the default for everything else; a new public page is a deliberate exception each time, not a pattern to repeat casually.
- Public sign-up / self-registration — accounts are invite-only, created by the core team.
- Role-based permission differences — flat access for v1; revisit only as a deliberate change.
- Enforced status pipeline / state machine — status stays a free tag.
- GST/invoicing generation — payments are simple line items, not formal invoices.
- Automated follow-up reminders/nudges — declined during discovery; remarks stays free text.
- Any cinematic/motion craft — Essential tier only, confirmed by the discovery scorecard.

## Build order (security-first, per the IDP's app golden path)

1. Auth (real per-person Supabase accounts, invite-only) →
2. RLS policies (deny-by-default; authenticated-only read/write, everyone equal) →
3. **Prove cross-user denial** — an unauthenticated request must be refused by every table, before any feature is built on top →
4. Then features, in this order: students/leads CRUD → payments → dashboard → CSV export → CSV import (once the file lands).

## Success criteria

No formal conversion/analytics funnel (not a marketing site). Operational success = the team can log a lead in under the time it currently takes in Excel, no fee/payment data is ever ambiguous (balance-due is always correct because it's derived, not typed in), and nothing is lost to concurrent-edit conflicts the way Excel could.

## Open items (carried from discovery, still unresolved)

1. Excel import file — pending from the owner; import utility's exact column mapping depends on it.
2. Real names for the 2 locations and 6 batches — placeholders only until provided.
3. The actual 5–8 team member names/emails, to create invite-only accounts.
4. Final agreed list of status tag values (e.g. Inquiry / Demo Scheduled / Demo Done / Joined / Not Interested) — a starter set will be proposed in the Data Model doc, but should be confirmed, not assumed final.
