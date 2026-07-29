# Data Model & Security — garba-arts-admin

*Companion to [`app-prd.md`](app-prd.md). Schema plus, for every table, exactly who may read/write which rows. Deny by default — RLS specified, not assumed. Migration format: the IDP's plain-SQL `-- migrate:up` / `-- migrate:down` convention, one file per table/change under `template/db/migrations/`.*

---

## Security posture (applies to every table below)

- **RLS is enabled on every table, no exceptions.**
- **The `anon` role gets zero grants anywhere.** This app has no public read surface at all — a stricter posture than the IDP's default marketing/portal golden paths.
- **Flat permissions:** every policy checks only `auth.uid() is not null` (any authenticated core-team member) — no per-row ownership check, no `has_role()` tiering. This matches the App PRD's confirmed flat-role model. If a role split is ever introduced, these policies are the ones to revisit.
- **Soft-delete via `deleted_at` / `deleted_by`** on every mutable table — normal "delete" sets these columns; normal queries filter `deleted_at is null`.
- **Permanent removal is a real `DELETE`**, gated in the app layer behind its own confirmation step, and **always preceded by a `writeAuditLog()` call** (the IDP's `lib/patterns/audit-log.ts`) so the trail survives the row.
- Every insert/update captures `created_by` / `updated_by` from the authenticated session (never client-supplied) — this is how "who entered/edited this" attribution works, per the discovery decision to use real per-person logins instead of a manual picker.

---

## Tables

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
| `source` | text | e.g. whatsapp / instagram / referral / walk-in / other — free text, not an enforced enum (sources will vary) |
| `status` | text | Free tag, no enforced transitions. **Starter suggested set** (confirm with owner, not final): `inquiry`, `demo_scheduled`, `demo_done`, `joined`, `not_interested`, `dropped`. Stored as plain text so new values can be added without a migration. |
| `location_id` | uuid, fk → locations | |
| `batch_id` | uuid, fk → batches | |
| `starting_date` | date, nullable | Null until the person actually starts |
| `fee_total` | numeric(10,2), nullable | One-time, custom per student (confirmed). Null until a fee is agreed |
| `remarks` | text | Free text (confirmed — no structured follow-up/reminder field for v1) |
| `created_by` | uuid, fk → auth.users, not null | From session, never client-supplied |
| `created_at` | timestamptz, default now() | |
| `updated_by` | uuid, fk → auth.users | |
| `updated_at` | timestamptz | |
| `deleted_by` | uuid, fk → auth.users, nullable | Soft-delete |
| `deleted_at` | timestamptz, nullable | Soft-delete |

**RLS:** authenticated: full read/write (insert/update/soft-delete via `deleted_at`). anon: none. Hard `DELETE` privilege is granted to `authenticated` at the DB level (flat permissions — anyone can permanently remove), but the app UI requires a separate confirmation step and an `audit_log` entry before issuing it.

### `payments`
Line items, not a single "amount paid" field — required because fees can split across modes and installments (confirmed).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk | |
| `student_id` | uuid, fk → students, not null | |
| `amount` | numeric(10,2), not null | |
| `mode` | text, not null | `cash` \| `upi` (extend if a third mode ever appears — free text with these two as the only UI options for now) |
| `paid_date` | date, not null | |
| `remarks` | text, nullable | e.g. "part payment" |
| `created_by` | uuid, fk → auth.users, not null | |
| `created_at` | timestamptz, default now() | |
| `deleted_by` | uuid, fk → auth.users, nullable | Soft-delete (correcting a mis-entered payment) |
| `deleted_at` | timestamptz, nullable | |

**RLS:** authenticated: full read/write. anon: none. Same hard-delete-with-audit-log rule as `students`.

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

---

## Auth model

Real per-person Supabase Auth accounts (email/password or magic link — pick at build time), **invite-only**: accounts are created directly by the core team (e.g. via Supabase dashboard or a small admin-created-invite flow), never via public self-signup. No `user_roles` table is needed for v1 given flat permissions — every `auth.users` row is equally privileged inside this app. Team member identity (name shown in the UI for "entered by") can come from `auth.users.email` or a minimal `profiles(user_id, display_name)` table if emails aren't friendly enough to show directly — decide once the actual 5–8 names/emails are provided (open item, see `app-prd.md`).

## Cross-user denial proof (required before any feature ships)

Per the security-first build order: after RLS is written, prove — with an actual unauthenticated request — that every table above refuses read and write. This is a pass/fail gate, not a suggestion, per the IDP's app golden path.

## Open items (carried from discovery / App PRD, still unresolved)

1. Real names for `locations` (2) and `batches` (6) — seed data is placeholder until provided.
2. Final status tag values — starter set proposed above, needs owner confirmation.
3. The 5–8 team members' actual names/emails, to create their accounts and decide the `profiles` question.
4. Excel import column mapping — depends on the file, not yet shared.
