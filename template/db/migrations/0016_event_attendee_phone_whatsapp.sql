-- 0016_event_attendee_phone_whatsapp — the "extra people coming" UI is being
-- rebuilt from a one-name-per-line textarea into a number-driven set of
-- dynamic rows (owner: "5 is written then 5 rows will come... name and
-- whatsapp number"). Each attendee row needs somewhere to actually store
-- phone/WhatsApp, not just a name. Both nullable - confirmed only Name is
-- required per attendee, Phone/WhatsApp stay optional (same as the
-- registrant's own phone field).

-- migrate:up
alter table event_attendees add column phone_number text;
alter table event_attendees add column whatsapp_number text;

-- migrate:down
alter table event_attendees drop column whatsapp_number;
alter table event_attendees drop column phone_number;
