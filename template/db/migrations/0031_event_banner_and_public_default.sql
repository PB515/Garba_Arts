-- 0031_event_banner_and_public_default — decision #83: events get a real
-- public-facing poster page (an uploaded banner image, not just a bare
-- form), and public self-registration now defaults to ON for every new
-- event instead of off. The owner's call: the public link is now the
-- primary way people register; admin-entered stays available for someone
-- who calls in instead of using the link.

-- migrate:up

alter table events add column banner_image_url text;
alter table events alter column public_registration_enabled set default true;

-- A public bucket - the poster page is genuinely public (no session), so the
-- image itself has to be readable without auth. Only staff (any authenticated
-- user - this app has no other kind of account) may upload/replace/remove,
-- same flat trust model as the events table's own RLS.
insert into storage.buckets (id, name, public)
values ('event-banners', 'event-banners', true)
on conflict (id) do nothing;

create policy "event banners are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'event-banners');

create policy "staff can upload event banners"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'event-banners');

create policy "staff can replace event banners"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'event-banners')
  with check (bucket_id = 'event-banners');

create policy "staff can remove event banners"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-banners');

-- migrate:down

drop policy if exists "staff can remove event banners" on storage.objects;
drop policy if exists "staff can replace event banners" on storage.objects;
drop policy if exists "staff can upload event banners" on storage.objects;
drop policy if exists "event banners are publicly readable" on storage.objects;
delete from storage.buckets where id = 'event-banners';
alter table events alter column public_registration_enabled set default false;
alter table events drop column if exists banner_image_url;
