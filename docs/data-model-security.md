# Data Model & Security — garba-arts-admin

*Companion to [`app-prd.md`](app-prd.md). Schema plus, for every table, exactly who may read/write which rows. Deny by default — RLS specified, not assumed. Migration format: the IDP's plain-SQL `-- migrate:up` / `-- migrate:down` convention, one file per table/change under `template/db/migrations/`.*

---

## Security posture (applies to every table below)

- **RLS is enabled on every table, no exceptions.**
- **The `anon` role gets zero grants anywhere — including `navratri_registrations` and `event_attendees`/`event_registrations`, the tables the two public pages write to.** `/navratri` and (per-event, opt-in) `/events/[id]/register` both write through a **server action using the service-role client**, not a direct anon RLS grant. This matters for a real reason beyond consistency: Navratri's price must be computed server-side from the trusted clock, never trusted from the client; event registration re-checks `public_registration_enabled` server-side rather than trusting the page wouldn't have rendered the form otherwise. `verify-denial.ts` proves both halves for every public-adjacent table: the public page can write (tested live in the browser), and a direct anon API call cannot (RLS still denies it).
- **Roles, not flat permissions, as of `0008_roles_and_location_scoping.sql`.** The original v1 model (every authenticated user equal) held only through the first live pass — the owner then asked for a real split: `super_admin` (owner + family, sees everything merged) and `location_admin` (tied to exactly one location, zero access — not even read — to any other location's `students`/`payments`). `locations`/`batches`/`navratri_registrations`/`audit_log` are **not** location-scoped. `event_registrations`/`event_attendees` **are** (`0015_event_registration_location_scoping.sql`), resolving the earlier open question — but `events` itself stays unscoped, since an event's venue is unrelated to Aalay/Sportsclub; the location lives on each registration instead (see the `events` section below). `is_super_admin()` / `staff_location_id()` are `SECURITY DEFINER` helpers reading a new `staff_roles` table, same pattern as the IDP's `has_role.sql`.
- **Soft-delete via `deleted_at` / `deleted_by`** on every mutable table — normal "delete" sets these columns; normal queries filter `deleted_at is null`.
- **Permanent removal is a real `DELETE`**, gated in the app layer behind its own confirmation step, and **always followed by a `writeAuditLog()` call** (the IDP's `lib/patterns/audit-log.ts`), never preceded — writing the log first would leave a false "deleted" trail if the delete then failed (a real bug hit and fixed during the students build, see `CLAUDE.md`'s Phase 2 log).
- Every insert/update captures `created_by` / `updated_by` from the authenticated session (never client-supplied) — this is how "who entered/edited this" attribution works, per the discovery decision to use real per-person logins instead of a manual picker.

---

## Tables

### `staff_roles`
The role/location-assignment table. Never written to by the app itself — only `tooling/create-account.ts` (service-role) sets it, so there's exactly one place role assignment happens.

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid, pk, fk → auth.users | One role per user |
| `role` | text, not null, check in ('super_admin','location_admin') | |
| `location_id` | uuid, fk → locations, nullable | Required (constraint-enforced) when `role = 'location_admin'`; must be null for `super_admin` |
| `created_at` | timestamptz, default now() | |

**RLS:** authenticated: read-only (every user can read the role table — the app needs it for UI decisions like hiding the Fees link). No authenticated insert/update/delete — only `service_role` can write.

### `locations`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `name` | text, not null, unique | Placeholder values until the real 2 names are confirmed |
| `created_at` | timestamptz, default now() | |

**RLS:** authenticated: full read/write. anon: none.

### `batches`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `location_id` | uuid, fk → locations, not null | Each batch belongs to exactly one location (confirmed) |
| `name` | text, not null | Placeholder values until the real 6 names are confirmed |
| `created_at` | timestamptz, default now() | |

**RLS:** authenticated: full read/write. anon: none.

### `students`
The core record — an inquiry/lead and, later, a student, are the same row (status changes in place; no separate "lead" table, since a person can enter at any stage per the discovery decision that status is not an enforced pipeline).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `name` | text, not null | |
| `phone_number` | text, not null | |
| `whatsapp_number` | text, nullable | Separate from `phone_number` — some people call on one number, WhatsApp on another. Added `0009_whatsapp_and_split_payment.sql`. |
| `source` | text | e.g. whatsapp / instagram / referral / walk-in / other — free text, not an enforced enum (sources will vary) |
| `source_detail` | text, nullable | Extra context for *any* source (which Instagram post, which WhatsApp group, who spoke to them at a walk-in) — renamed from `referred_by` (`0010_source_detail.sql`) after the owner asked for the same mechanic on every source, not just Referral. One generic field, not a different one per source. |
| `status` | text | Free tag, no enforced transitions. **The 3-color simplification, confirmed** (replaces the earlier 6-value scheme): `follow_up` (yellow, "ask again"), `dropped` (red, not interested at any stage), `joined` (green). A record never leaves the Inquiry list once created — it's a permanent historical log; "joined" just means it *also* shows up in the Joined list. Still plain text, not a CHECK constraint (status stays a flexible field, not an enforced pipeline). |
| `location_id` | uuid, fk → locations | Also the location-scoping key for RLS — see the security posture note above |
| `batch_id` | uuid, fk → batches | |
| `inquiry_date` | date, nullable | The date this lead/inquiry came in — renamed from `starting_date` after owner feedback that the original name read as "class start date," which wasn't the intent. Defaults to today on the add-inquiry form but stays editable (backdateable) for retroactive entry. |
| `fee_total` | numeric(10,2), nullable | One-time, custom per student (confirmed). Null until a fee is agreed |
| `demo_fee_amount` | numeric(10,2), nullable | A small, separate fee for attending the trial/demo lecture — independent of `fee_total` and independent of outcome (charged whether the lead ends up joined or dropped). Added `0008_roles_and_location_scoping.sql`. |
| `demo_fee_paid` | numeric(10,2), not null, default 0 | |
| `remarks` | text | Free text (confirmed — no structured follow-up/reminder field for v1). Also where the "why" behind a dropped lead lives (took demo but not interested vs. never took demo vs. filled the form and went cold) rather than more status enum values. |
| `created_by` | uuid, fk → auth.users, not null | From session, never client-supplied |
| `created_at` | timestamptz, default now() | |
| `updated_by` | uuid, fk → auth.users | |
| `updated_at` | timestamptz | |
| `deleted_by` | uuid, fk → auth.users, nullable | Soft-delete |
| `deleted_at` | timestamptz, nullable | Soft-delete |

**RLS:** `is_super_admin() or location_id = staff_location_id()`, both for read and write (`with check` mirrors `using`, so a `location_admin` can't insert/update a row into another location either — attempting it is a straight RLS rejection, not a silent no-op). anon: none. Hard `DELETE` is included in the same policy (both roles can permanently remove within their access), gated in the app UI behind a confirmation step and an `audit_log` entry.

### `payments`
Line items, not a single "amount paid" field — required because fees can split across modes and installments (confirmed).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `student_id` | uuid, fk → students, not null | |
| `amount` | numeric(10,2), not null | |
| `mode` | text, not null, check in ('cash','upi','cash_upi') | `cash_upi` = a single split payment (part cash, part UPI) logged as one entry, not two rows — the owner's explicit preference over a two-line-item approach. Added `0009_whatsapp_and_split_payment.sql`. |
| `cash_amount` | numeric, nullable | Only set when `mode = 'cash_upi'` — the real cash portion of a split payment. Added `0013_payment_cash_upi_split.sql` so the Fees tab can reconcile true Total Cash against Total collected, not just show a combined split total. |
| `upi_amount` | numeric, nullable | Only set when `mode = 'cash_upi'` — the real UPI portion, same reasoning as `cash_amount`. |

`payments_cash_upi_split_check` (`0014_payments_cash_upi_split_check.sql`) enforces both directions at the database level: a `cash_upi` row must have both `cash_amount`/`upi_amount` set and summing to `amount`; a plain `cash`/`upi` row must have both null. Added after a full audit found this was only ever guaranteed by the app's own validation (`addPayment()`), which wouldn't protect a future bulk import or a manual DB fix — this closes that gap permanently rather than relying on every future write path remembering to validate correctly.
| `paid_date` | date, not null | |
| `remarks` | text, nullable | e.g. "part payment" |
| `created_by` | uuid, fk → auth.users, not null | |
| `created_at` | timestamptz, default now() | |
| `deleted_by` | uuid, fk → auth.users, nullable | Soft-delete (correcting a mis-entered payment) |
| `deleted_at` | timestamptz, nullable | |

**RLS:** location-scoped through the parent student — `is_super_admin() or exists (select 1 from students s where s.id = payments.student_id and s.location_id = staff_location_id())`. anon: none. Same hard-delete-with-audit-log rule as `students`. Also visible on an individual student's own detail page regardless of role (that's "individual," not "combined") — the combined view (`/fees`, CSV export) is a separate, app-level, super-admin-only restriction on top of this (RLS wouldn't naturally block a `location_admin` from combining just their own location's numbers — the restriction there is "no combined view at all for them," enforced in the route, not the database).

**Derived, not stored:** `balance_due = students.fee_total - sum(payments.amount where deleted_at is null and student_id = students.id)`. Computed in a view or query, never written to a column — this is the "auto balance-due" the discovery brief called for, and storing it redundantly would let it drift out of sync with the payment log.

### `audit_log`
Already the IDP's standard shape (`lib/patterns/audit-log.ts`) — append-only, never updated or deleted.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `actor_id` | uuid, fk → auth.users, nullable | |
| `action` | text, not null | e.g. `student.permanently_deleted`, `payment.permanently_deleted` |
| `entity` | text, not null | e.g. `student`, `payment` |
| `entity_id` | uuid, not null | |
| `meta` | jsonb | Snapshot of the row being removed, so the record isn't fully lost even after a hard delete |
| `created_at` | timestamptz, default now() | |

**RLS:** authenticated: insert + read only. **No update, no delete for anyone** — append-only is enforced at the RLS level, not just by convention.

### `events` / `event_registrations` / `event_attendees`
Two write paths now: admin-entered (staff logs who's coming after a student tells them) **and**, per-event opt-in, real public self-registration at `/events/[id]/register` — the same "server action + service-role, never a direct anon RLS grant" pattern as `/navratri`, for the same reason (don't trust a public form's own account of the world; re-check `public_registration_enabled` server-side rather than assuming the page wouldn't have rendered the form otherwise).

- **`events.public_registration_enabled`** (boolean, not null, default false) — per-event toggle, added `0011_event_attendees_and_public_registration.sql`. Off by default; staff turns it on per event via a checkbox on the event's edit form.
- **`event_registrations.friend_count` is gone**, replaced by counting `event_attendees` rows — the owner wanted actual names ("who are coming, number and name"), not just a count, and wanted it *everywhere* (admin-entered and public alike), so a count-only column would have been redundant with the real source of truth.
- **`event_registrations.created_by` is nullable** (`0012_..._nullable_created_by.sql`) — a public registration has no session to attribute to. `events.created_by` stays `not null`; only staff create events.
- **`event_registrations.location_id`** (uuid, fk → locations, **nullable**, added `0015_event_registration_location_scoping.sql`) — the location-scoping key. Nullable specifically so a public self-registration can stay unattributed. RLS: `is_super_admin() or location_id = staff_location_id()`. A `null` never equals a real `staff_location_id()` value in SQL, so an unattributed row is automatically invisible to every `location_admin` and visible only to `super_admin` — that behavior falls out of the comparison itself, no extra clause needed. The admin "Add registration" form requires this field (app-level, mirroring how location is effectively required on the student add form); the public registration form was deliberately left unchanged, not asking a stranger which of the two locations they're with.
- **`event_attendees`**: `id`, `registration_id` (fk → event_registrations, not null), `name` (not null), `phone_number` (nullable), `whatsapp_number` (nullable, both added `0016_event_attendee_phone_whatsapp.sql`), `created_at`. RLS scopes through its parent registration (`exists (select 1 from event_registrations r where r.id = event_attendees.registration_id and r.location_id = staff_location_id())`), the same pattern `payments` uses through `students`.
- Both the admin "Add registration" form, the registration edit form, and the public form take attendees as dynamic name+phone+WhatsApp row-triples (the `AttendeeRows` client component — a number input drives how many rows render, capped at 20), parsed server-side (`lib/form.ts`'s `parseAttendeeRows`) into `event_attendees` rows. Only Name is required per row; Phone/WhatsApp stay optional. Editing a registration replaces the attendee list wholesale rather than diffing — simpler, and matches the form's own "this is the current full list" mental model. (Originally a one-name-per-line textarea via `parseNameList` — replaced entirely once the owner asked for phone/WhatsApp capture per attendee; the old function no longer exists.)
- Permanent-delete of an event cascades its registrations *and* their attendees first (no `ON DELETE CASCADE` — done explicitly in `events/actions.ts` so each deletion is deliberate and audit-logged, same FK-cascade-then-audit-log-after pattern established for students/payments).

### `navratri_registrations`
The one table with a public write path — see the security posture note above. Proof-of-concept: pricing/dates in `lib/navratri-config.ts` are placeholders.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `representative_name` | text, not null | The group's contact person — not an individual student account |
| `representative_phone` | text, not null | |
| `pass_count` | integer, not null, `>= 1` | How many passes this registration covers |
| `price_per_pass` | numeric(10,2), not null | Snapshotted at submission time from the tier active then — never recomputed later, so a price-tier change doesn't retroactively alter past registrations |
| `total_amount` | numeric(10,2), not null | `price_per_pass * pass_count`, computed server-side |
| `amount_paid` | numeric(10,2), not null, default 0 | Logged manually by staff (no payment gateway, per decision #24) |
| `remarks`, `deleted_by`, `deleted_at`, `updated_by`, `updated_at` | | Same shape as other tables |

No `created_by` — there's no authenticated session to attribute a public submission to.

---

## Auth model

Real per-person Supabase Auth accounts, **invite-only** (`tooling/create-account.ts`, service-role, never public self-signup). Every account now needs a `staff_roles` row, assigned at creation time by the same script:

```bash
npm run create-account -- <email> <password> super_admin
npm run create-account -- <email> <password> location_admin "Aalay"
```

Two roles: **`super_admin`** (owner + family — sees everything merged across locations) and **`location_admin`** (tied to exactly one location — full CRUD within it, zero access, not even read, to any other location's students/payments). This reverses the original flat-permission model (every user equal) from the first live pass — the owner asked for a real split once the app was actually in use. `create-account.ts` is safe to re-run against an existing email (it looks the account up and re-assigns the role instead of failing), which also makes it the tool for "fix someone's role."

## Cross-user denial proof (required before any feature ships)

Two separate gates, both must pass before any feature that touches these tables:

1. **`tooling/verify-denial.ts`** — the anon-vs-authenticated boundary. Proves an unauthenticated request is refused, read and write, on every table (14 checks across 8 tables as of `event_attendees`).
2. **`tooling/verify-location-denial.ts`** — the `location_admin`-vs-`location_admin` boundary, added when the role split shipped. Signs in as real test accounts (an Aalay admin, a Sportsclub admin, and the super-admin) and proves: each sees their own location's students/payments (and, since `0015`, event registrations/attendees); neither sees the other's, for both read *and* write; the super-admin sees both merged, including unattributed public registrations. This is a materially different property from #1 — passing #1 alone would not have caught a bug where two authenticated users can see each other's location. 17 checks total as of the events location-scoping addition.

Both are pass/fail gates, not a suggestion, per the IDP's app golden path — extended here because the golden path's own "cross-user denial" language undersold what this build actually needed (cross-*location*-among-authenticated-users, not just anon-vs-authenticated).

## Open items (carried from discovery / App PRD, still unresolved)

1. Excel import column mapping — depends on the file, not yet shared.
2. Real names/emails for the location admins beyond the owner + family super-admins, if there end up being more than one location admin per location.
