-- 0024_lead_log_whatsapp_number — the new WhatsApp quick-action button on
-- the Lead tab needs whatsapp_number, which lead_log() (0023) doesn't
-- return yet. Changing a `returns table` shape needs drop + recreate, not
-- `create or replace` (Postgres rejects a signature change there).

-- migrate:up

drop function if exists public.lead_log();

create function public.lead_log()
returns table (
  id uuid,
  name text,
  phone_number text,
  whatsapp_number text,
  status text,
  source text,
  remarks text,
  location_id uuid
)
language sql
security definer
set search_path = public
stable
as $$
  select s.id, s.name, s.phone_number, s.whatsapp_number, s.status, s.source, s.remarks, s.location_id
  from students s
  where s.is_lead = true
    and s.deleted_at is null
    and exists (select 1 from staff_roles r where r.user_id = auth.uid())
  order by s.created_at desc;
$$;

revoke all on function public.lead_log() from public;
grant execute on function public.lead_log() to authenticated;

-- migrate:down

drop function if exists public.lead_log();

create function public.lead_log()
returns table (
  id uuid,
  name text,
  phone_number text,
  status text,
  source text,
  remarks text,
  location_id uuid
)
language sql
security definer
set search_path = public
stable
as $$
  select s.id, s.name, s.phone_number, s.status, s.source, s.remarks, s.location_id
  from students s
  where s.is_lead = true
    and s.deleted_at is null
    and exists (select 1 from staff_roles r where r.user_id = auth.uid())
  order by s.created_at desc;
$$;

revoke all on function public.lead_log() from public;
grant execute on function public.lead_log() to authenticated;
