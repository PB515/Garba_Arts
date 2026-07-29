# Golden Path — Portal (Authenticated App)

*Login · roles · private per-user data. Source: Patel CA client portal, Inspire Academy parent portal, Purven CMS. The Playbook PART 7 extension applies.*

**Use when:** the site has accounts and shows data that must stay private between users.

## Phase order — SECURITY-FIRST (not features-first)

```
0. Setup + tokens + App PRD (roles: e.g. client / staff / admin) + data-model & security doc
1. Auth — login / logout / session works, BEFORE any private data exists
2. Access rules — enable RLS; write policies with has_role(); deny by default
3. PROVE DENIAL (the gate) — log in as user A, try to read user B's rows by URL /
   API / guessed id → it MUST fail. Non-negotiable before any data feature.
4. THEN features — the screens on top, one role at a time
5. Runtime-dependency fallbacks — every logged-in fetch has loading(timeout)/empty/failed
6. Polish + deploy (smoke test includes the cross-user denial on the LIVE url)
```

## Pulls in

- Supabase: all four clients — `server` (RSC as the user), `middleware` (session refresh), `service-role` (trusted server tasks only), `client` (interactive)
- SQL: `has_role()` + RLS policies (deny by default, allow on purpose)
- Patterns: `audit-log` (sensitive actions), `view-edit-form`, `chip-list-editor`, `two-query-write`, `empty-state`
- Gates: the cross-user denial gate (PART 7); the mobile/theme gate

## Gotchas

- **Features-first is the trap** — build dashboards last, access control first.
- **Service-role bypasses RLS** — server-only, never in client code (`import 'server-only'`).
- **Don't run code between `createServerClient` and `getUser`** in middleware — causes random logouts.
- A leak here isn't a cosmetic bug — it's one user seeing another's data.
