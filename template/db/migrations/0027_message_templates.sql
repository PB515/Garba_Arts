-- 0027_message_templates — a real WhatsApp message library instead of one
-- hardcoded string. The owner wants several reusable templates (Lead
-- follow-up, Fee reminder, etc.), open to every role to view AND
-- create/edit for now - a real permission split is a deliberately deferred
-- decision, not an oversight, so this starts as flat as `batches` already
-- is rather than guessing at a restriction nobody's asked for yet.

-- migrate:up

create table message_templates (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  body text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

alter table message_templates enable row level security;

create policy "message_templates authenticated full access" on message_templates
  for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on message_templates to authenticated, service_role;

insert into message_templates (label, body) values
  ('Lead follow-up', 'Hi {name}, this is The Garba Arts. Thanks for your interest! Have you decided between our Aalay and Sportsclub batches yet?'),
  ('Inquiry follow-up', 'Hi {name}, this is The Garba Arts, following up on your inquiry. Let us know if you have any questions about joining!'),
  ('Fee reminder', 'Hi {name}, this is The Garba Arts. Just a reminder that your fee balance is still pending - let us know if you''d like to arrange payment.'),
  ('Demo fee reminder', 'Hi {name}, this is The Garba Arts. Just a quick reminder about the demo class fee.'),
  ('Joined welcome', 'Hi {name}, welcome to The Garba Arts! You''re confirmed for your batch - see you at class!');

-- migrate:down

drop table message_templates;
