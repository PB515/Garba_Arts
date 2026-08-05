-- 0021_rename_aliya_to_aalay — the owner corrected the real location name;
-- "Aliya" was wrong from the start (decision #16 origin), the real name is
-- "Aalay". Pure data rename, no schema change — every foreign key already
-- points at the location's id, not its name, so nothing else needs to move.

-- migrate:up
update locations set name = 'Aalay' where name = 'Aliya';

-- migrate:down
update locations set name = 'Aliya' where name = 'Aalay';
