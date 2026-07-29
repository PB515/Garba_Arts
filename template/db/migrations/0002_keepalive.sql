-- 0002_keepalive — free-tier keep-alive target.
-- A trivial function the /api/health route calls daily (via an external cron) so
-- the real DB query resets Supabase's 7-day inactivity timer and the project
-- doesn't pause. Granted to anon so the health route works logged-out.
-- See docs/runbooks/free-tier-uptime.md. Safe to keep in production.

-- migrate:up
create or replace function public.keepalive()
returns timestamptz
language sql
stable
as $$ select now(); $$;

grant execute on function public.keepalive() to anon, authenticated;

-- migrate:down
drop function if exists public.keepalive();
