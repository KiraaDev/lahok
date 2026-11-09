-- Lahok demo data (FAKE names only)
--
-- Optional. Run this AFTER schema.sql, once, on a development or demo project.
-- Do not run it on a database that holds real participants.

insert into public.events
  (title, slug, description, starts_at, ends_at, venue, category, status, is_public)
values
  ('Youth Basketball Tournament', 'youth-basketball-tournament',
   'Inter-purok basketball tournament for all ages.',
   now() + interval '7 days', now() + interval '7 days 6 hours',
   'Barangay Covered Court', 'sports', 'upcoming', true),
  ('Coastal Clean-up Drive', 'coastal-clean-up-drive',
   'Bring gloves and sacks.',
   now() + interval '14 days', null,
   'Barangay Beachfront', 'clean_up', 'draft', false),
  ('Youth Assembly', 'youth-assembly',
   'Quarterly general assembly.',
   now() - interval '10 days', now() - interval '10 days' + interval '3 hours',
   'Barangay Hall', 'assembly', 'completed', true);

insert into public.participants
  (first_name, middle_name, last_name, birthdate, sex, zone, contact_number)
values
  ('Juan', 'Santos', 'Dela Cruz', '2004-03-14', 'male', 'Zone 1', '09171234567'),
  ('Maria', 'Reyes', 'Garcia', '2001-08-22', 'female', 'Zone 2', null),
  ('Jose', null, 'Ramos', '2010-11-05', 'male', 'Zone 1', null),
  ('Ana', 'Lim', 'Bautista', '1985-06-30', 'female', 'Zone 3', '09281234567'),
  ('Pedro', 'Cruz', 'Aquino', '1958-01-17', 'male', 'Zone 2', null),
  ('Rosario', null, 'Villanueva', '1952-09-09', 'female', 'Zone 3', null);

insert into public.registrations (event_id, participant_id)
select e.id, p.id
from public.events e
cross join (
  select id from public.participants order by last_name limit 4
) p
where e.slug = 'youth-basketball-tournament';