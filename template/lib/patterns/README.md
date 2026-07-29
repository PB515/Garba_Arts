# patterns/

*Small, copy-owned solutions to problems every build re-hit. Patterns, not a library (charter §8) — read them, use them, edit them per site. Each carries its "use when" in its file header; the table is the index.*

| Pattern | Use when |
|---|---|
| `empty-state.tsx` | A list/table/section has no rows yet — show a real empty state, not a blank screen (Polish-bar rail). |
| `chip-list-editor.tsx` | Editing a list of short strings (tags, categories, sizes) as removable chips with an add field. |
| `view-edit-form.tsx` | A record toggles between read-only "view" and inline "edit" (profile fields, settings, admin panels). |
| `audit-log.ts` | A consequential write (status, money, role, deletion) must leave a who/what/when trail. |
| `two-query-write.ts` | A write must return shaped/joined data, or must be idempotent (insert-then-select; check-then-insert). |
| `has_role.sql` | An authed app needs role-based RLS — `using (has_role('staff'))` instead of repeating a subquery. |

**Supabase clients** live one level up in `lib/supabase/` — the 4-client split:

| Client | Use when |
|---|---|
| `client.ts` | Client Component needs Supabase (forms, realtime) — anon key, user's RLS. |
| `server.ts` | Server Component / Route Handler / Action — runs as the logged-in user. |
| `middleware.ts` | `middleware.ts` refreshing the auth session each request. |
| `service-role.ts` | Trusted server-only task that must bypass RLS (webhooks, cron, seed). **Never** in browser code. |
