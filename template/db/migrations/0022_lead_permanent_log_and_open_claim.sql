-- 0022_lead_permanent_log_and_open_claim — the owner's real workflow needed
-- two changes to the Lead concept:
--
-- 1) Lead stops being a shrinking pool that empties out as things get
--    claimed - it becomes a permanent log of every call that ever came in
--    undecided, same "permanent record" philosophy Inquiry already has
--    (decision #30). Whether a row is "a Lead" can no longer be inferred
--    from location_id being null (that stops being true the instant it's
--    claimed) - it needs its own flag that's set once and never unset.
--    `is_lead` does that. The Lead tab's list is now `is_lead = true`
--    (permanent), tinted red while `location_id is null` (not yet moved to
--    Inquiry/Joined) and white once it's set (already moved).
--
-- 2) The owner confirmed a claimed-Lead-origin row should stay visible to
--    EVERY admin forever, not just whoever's location it landed in - a real,
--    deliberate widening of visibility (RLS's existing "or location_id is
--    null" branch already made unclaimed Leads shared; this makes the
--    permanent record of them shared too, regardless of current location).
--
-- Existing rows are test data (owner's call, not reconstructed) - only
-- currently-unclaimed rows are backfilled to is_lead = true; already-claimed
-- rows have no reliable way to know their origin, so the permanent log
-- starts clean from here, not retroactively.

-- migrate:up

alter table students add column is_lead boolean not null default false;

update students set is_lead = true where location_id is null;

drop policy if exists "location-scoped access" on students;
create policy "location-scoped access" on students
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id() or location_id is null or is_lead = true)
  with check (is_super_admin() or location_id = staff_location_id() or location_id is null or is_lead = true);

drop policy if exists "location-scoped access" on payments;
create policy "location-scoped access" on payments
  for all
  to authenticated
  using (
    is_super_admin()
    or exists (
      select 1 from students s
      where s.id = payments.student_id
        and (s.location_id = staff_location_id() or s.location_id is null or s.is_lead = true)
    )
  )
  with check (
    is_super_admin()
    or exists (
      select 1 from students s
      where s.id = payments.student_id
        and (s.location_id = staff_location_id() or s.location_id is null or s.is_lead = true)
    )
  );

-- Claiming is no longer restricted to your own location (owner confirmed
-- directly) - any authenticated staff member, any role, can claim a lead
-- into either location. Same already-claimed guard as before.
create or replace function public.claim_lead(p_student_id uuid, p_location_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_location uuid;
begin
  if not (
    is_super_admin()
    or is_triage_admin()
    or staff_location_id() is not null
  ) then
    raise exception 'not authorized to claim a lead';
  end if;

  select location_id into v_current_location from students where id = p_student_id;
  if v_current_location is not null then
    raise exception 'this lead has already been claimed';
  end if;

  update students
  set location_id = p_location_id, updated_at = now()
  where id = p_student_id;
end;
$$;

-- migrate:down

create or replace function public.claim_lead(p_student_id uuid, p_location_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_location uuid;
begin
  if not (
    is_super_admin()
    or is_triage_admin()
    or (staff_location_id() is not null and staff_location_id() = p_location_id)
  ) then
    raise exception 'not authorized to claim a lead into this location';
  end if;

  select location_id into v_current_location from students where id = p_student_id;
  if v_current_location is not null then
    raise exception 'this lead has already been claimed';
  end if;

  update students
  set location_id = p_location_id, updated_at = now()
  where id = p_student_id;
end;
$$;

drop policy if exists "location-scoped access" on payments;
create policy "location-scoped access" on payments
  for all
  to authenticated
  using (
    is_super_admin()
    or exists (
      select 1 from students s
      where s.id = payments.student_id
        and (s.location_id = staff_location_id() or s.location_id is null)
    )
  )
  with check (
    is_super_admin()
    or exists (
      select 1 from students s
      where s.id = payments.student_id
        and (s.location_id = staff_location_id() or s.location_id is null)
    )
  );

drop policy if exists "location-scoped access" on students;
create policy "location-scoped access" on students
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id() or location_id is null)
  with check (is_super_admin() or location_id = staff_location_id() or location_id is null);

alter table students drop column is_lead;
