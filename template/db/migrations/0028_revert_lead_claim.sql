-- 0028_revert_lead_claim — undoes a mistaken claim (e.g. an Aalay admin
-- meant to claim for Aalay but hit "Claim for Sportsclub"). Symmetric with
-- claim_lead() (0022's open-claiming shape): any real staff member, any
-- role, may revert any claim — not just their own location's — matching
-- how claiming itself is already open to everyone. Scoped to is_lead = true
-- rows only, so this can't be used as a general "clear anyone's location"
-- tool on an ordinary Inquiry-origin student. Clears batch_id along with
-- location_id, since a batch belongs to a specific location and would be
-- meaningless once the record goes back to the unclaimed pool.

-- migrate:up

create function public.revert_lead_claim(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_lead boolean;
  v_location_id uuid;
begin
  if not (
    is_super_admin()
    or is_triage_admin()
    or staff_location_id() is not null
  ) then
    raise exception 'not authorized to revert a lead claim';
  end if;

  select is_lead, location_id into v_is_lead, v_location_id from students where id = p_student_id;

  if v_is_lead is not true then
    raise exception 'this record did not originate as a lead';
  end if;

  if v_location_id is null then
    raise exception 'this lead has not been claimed';
  end if;

  update students
  set location_id = null, batch_id = null, updated_at = now()
  where id = p_student_id;
end;
$$;

revoke all on function public.revert_lead_claim(uuid) from public;
grant execute on function public.revert_lead_claim(uuid) to authenticated;

-- migrate:down

drop function if exists public.revert_lead_claim(uuid);
