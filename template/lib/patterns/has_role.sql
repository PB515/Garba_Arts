-- has_role() — the RLS helper for role-based access.
--
-- Use when: an authenticated app needs roles (client / staff / admin) and you
-- want RLS policies to read like `using (has_role('staff'))` instead of
-- repeating a subquery. Pair with the security-first order: enable RLS, write
-- policies with this helper, then PROVE cross-user denial before any feature.
--
-- Apply this via a migration (copy into db/migrations/NNNN_roles.sql). It assumes
-- a `user_roles(user_id uuid, role text)` table; adjust to your schema.
--
-- SECURITY DEFINER + a locked search_path so the function can read user_roles
-- under RLS without opening a recursion hole.

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = required_role
  );
$$;

revoke all on function public.has_role(text) from public;
grant execute on function public.has_role(text) to authenticated;

-- Example policy (deny by default, allow on purpose):
--   alter table invoices enable row level security;
--   create policy "staff read all invoices"
--     on invoices for select
--     using ( has_role('staff') );
