-- 0004_seed_locations_batches — the real 2 locations and 6 batches (3 times
-- x 2 locations), replacing the discovery brief's placeholder. Provided by
-- the owner directly in chat, not fabricated.

-- migrate:up
insert into locations (name) values ('Aliya'), ('Sportsclub');

insert into batches (location_id, name)
select l.id, b.name
from locations l
cross join (values ('8-9 PM'), ('9-10 PM'), ('10-11 PM')) as b(name)
where l.name in ('Aliya', 'Sportsclub');

-- migrate:down
delete from batches where location_id in (select id from locations where name in ('Aliya', 'Sportsclub'));
delete from locations where name in ('Aliya', 'Sportsclub');
