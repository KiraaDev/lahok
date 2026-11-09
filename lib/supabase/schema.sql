-- Lahok database schema
--
-- Run this ONCE on a NEW Supabase project:
-- Supabase dashboard -> SQL Editor -> New query -> paste this file -> Run.
--
-- Everything runs in a single transaction. If anything fails, nothing is
-- applied, so you can fix the problem and run the whole file again.
--
-- After it succeeds:
--   1. Authentication -> Sign In / Providers -> Email -> turn OFF "Allow new users to sign up".
--   2. Authentication -> Users -> Add user. The FIRST user becomes the admin,
--      every user added after that becomes staff.

begin;

-- ============================================================
-- 1. Helper: keep updated_at current
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 2. Profiles and roles
-- ============================================================

create type public.user_role as enum ('admin', 'staff');

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  role       public.user_role not null default 'staff',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    case when not exists (select 1 from public.profiles)
         then 'admin'::public.user_role
         else 'staff'::public.user_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

alter table public.profiles enable row level security;

create policy "Read own profile or admin reads all"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "Only admins update profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================
-- 3. Barangay settings (a single row per deployment)
-- ============================================================

create table public.barangay_settings (
  id                integer primary key default 1 check (id = 1),
  barangay_name     text not null default 'Your Barangay',
  municipality_city text,
  province          text,
  logo_url          text,
  primary_color     text not null default '#1D4ED8'
                    check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  contact_email     text,
  contact_number    text,
  facebook_url      text,
  about             text,
  updated_at        timestamptz not null default now()
);

insert into public.barangay_settings (id) values (1);

create trigger barangay_settings_updated_at
before update on public.barangay_settings
for each row execute function public.set_updated_at();

alter table public.barangay_settings enable row level security;

create policy "Anyone can read settings"
on public.barangay_settings for select
to anon, authenticated
using (true);

create policy "Admins can update settings"
on public.barangay_settings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================
-- 4. Events
-- ============================================================

create type public.event_status as enum (
  'draft', 'upcoming', 'ongoing', 'completed', 'cancelled'
);

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null
              check (char_length(trim(title)) between 1 and 150),
  slug        text not null unique
              check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text
              check (char_length(description) <= 5000),
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  venue       text
              check (char_length(venue) <= 200),
  category    text not null default 'other'
              check (category in (
                'sports', 'clean_up', 'assembly', 'seminar',
                'livelihood', 'cultural', 'other'
              )),
  banner_url  text,
  status      public.event_status not null default 'draft',
  is_public   boolean not null default false,
  created_by  uuid default auth.uid()
              references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint events_ends_after_start
    check (ends_at is null or ends_at >= starts_at)
);

create index events_starts_at_idx on public.events (starts_at desc);
create index events_status_idx    on public.events (status);
create index events_public_idx    on public.events (starts_at) where is_public;

create trigger events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.events enable row level security;

create policy "Public can read public events"
on public.events for select
to anon, authenticated
using (is_public = true and status in ('upcoming', 'ongoing'));

create policy "Staff and admins can read all events"
on public.events for select
to authenticated
using (public.is_staff_or_admin());

create policy "Admins can create events"
on public.events for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update events"
on public.events for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete events"
on public.events for delete
to authenticated
using (public.is_admin());

-- ============================================================
-- 5. Participants (people of any age who join events)
-- ============================================================

create table public.participants (
  id             uuid primary key default gen_random_uuid(),
  first_name     text not null
                 check (char_length(trim(first_name)) between 1 and 80),
  middle_name    text
                 check (char_length(middle_name) <= 80),
  last_name      text not null
                 check (char_length(trim(last_name)) between 1 and 80),
  birthdate      date not null
                 check (birthdate >= date '1900-01-01'),
  sex            text not null
                 check (sex in ('male', 'female')),
  zone           text
                 check (char_length(zone) <= 60),
  contact_number text
                 check (char_length(contact_number) <= 30),
  qr_token       text not null unique
                 default replace(gen_random_uuid()::text, '-', ''),
  created_by     uuid default auth.uid()
                 references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index participants_name_idx
  on public.participants (lower(last_name), lower(first_name));

create index participants_birthdate_idx
  on public.participants (birthdate);

create unique index participants_unique_person_idx
  on public.participants (lower(first_name), lower(last_name), birthdate);

create trigger participants_updated_at
before update on public.participants
for each row execute function public.set_updated_at();

alter table public.participants enable row level security;

create policy "Staff and admins can read participants"
on public.participants for select
to authenticated
using (public.is_staff_or_admin());

create policy "Admins can create participants"
on public.participants for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update participants"
on public.participants for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete participants"
on public.participants for delete
to authenticated
using (public.is_admin());

-- ============================================================
-- 6. Registrations (who is signed up for which event)
-- ============================================================

create table public.registrations (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null
                 references public.events (id) on delete cascade,
  participant_id uuid not null
                 references public.participants (id) on delete cascade,
  registered_by  uuid default auth.uid()
                 references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  constraint registrations_event_participant_key
    unique (event_id, participant_id)
);

create index registrations_participant_idx
  on public.registrations (participant_id);

alter table public.registrations enable row level security;

create policy "Staff and admins can read registrations"
on public.registrations for select
to authenticated
using (public.is_staff_or_admin());

create policy "Admins can create registrations"
on public.registrations for insert
to authenticated
with check (public.is_admin());

create policy "Admins can delete registrations"
on public.registrations for delete
to authenticated
using (public.is_admin());

-- ============================================================
-- 7. Attendance (rows are only created by check_in_participant)
-- ============================================================

create table public.attendance (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null,
  participant_id uuid not null,
  checked_in_at  timestamptz not null default now(),
  checked_in_by  uuid default auth.uid()
                 references public.profiles (id) on delete set null,
  constraint attendance_event_participant_key
    unique (event_id, participant_id),
  constraint attendance_registration_fkey
    foreign key (event_id, participant_id)
    references public.registrations (event_id, participant_id)
    on delete cascade
);

create index attendance_event_time_idx
  on public.attendance (event_id, checked_in_at desc);

alter table public.attendance enable row level security;

create policy "Staff and admins can read attendance"
on public.attendance for select
to authenticated
using (public.is_staff_or_admin());

create policy "Admins can delete attendance"
on public.attendance for delete
to authenticated
using (public.is_admin());

-- ============================================================
-- 8. Table privileges (least privilege; RLS still applies on top)
-- ============================================================

revoke all on
  public.profiles,
  public.barangay_settings,
  public.events,
  public.participants,
  public.registrations,
  public.attendance
from anon, authenticated;

grant select, update on public.profiles to authenticated;

grant select on public.barangay_settings to anon, authenticated;
grant update on public.barangay_settings to authenticated;

grant select on public.events to anon;
grant select, insert, update, delete on public.events to authenticated;

grant select, insert, update, delete on public.participants to authenticated;
grant select, insert, delete on public.registrations to authenticated;
grant select, delete on public.attendance to authenticated;

-- ============================================================
-- 9. Check-in function (enforces the check-in rules in the database)
-- ============================================================

create or replace function public.check_in_participant(
  p_event_id uuid,
  p_participant_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status     public.event_status;
  v_person     jsonb;
  v_checked_at timestamptz;
  v_result     text;
begin
  if not public.is_staff_or_admin() then
    return jsonb_build_object('status', 'forbidden');
  end if;

  select status into v_status from public.events where id = p_event_id;
  if not found then
    return jsonb_build_object('status', 'event_not_found');
  end if;

  select jsonb_build_object(
           'id', p.id,
           'first_name', p.first_name,
           'middle_name', p.middle_name,
           'last_name', p.last_name,
           'zone', p.zone
         )
    into v_person
    from public.participants p
   where p.id = p_participant_id;

  if v_person is null then
    return jsonb_build_object('status', 'participant_not_found');
  end if;

  if v_status not in ('upcoming', 'ongoing') then
    return jsonb_build_object('status', 'event_closed', 'participant', v_person);
  end if;

  if not exists (
    select 1 from public.registrations
     where event_id = p_event_id and participant_id = p_participant_id
  ) then
    return jsonb_build_object('status', 'not_registered', 'participant', v_person);
  end if;

  insert into public.attendance (event_id, participant_id)
  values (p_event_id, p_participant_id)
  on conflict (event_id, participant_id) do nothing
  returning checked_in_at into v_checked_at;

  if v_checked_at is null then
    v_result := 'already_checked_in';
    select checked_in_at into v_checked_at
      from public.attendance
     where event_id = p_event_id and participant_id = p_participant_id;
  else
    v_result := 'checked_in';
  end if;

  return jsonb_build_object(
    'status', v_result,
    'participant', v_person,
    'checked_in_at', v_checked_at
  );
end;
$$;

revoke all on function public.check_in_participant(uuid, uuid) from public, anon;
grant execute on function public.check_in_participant(uuid, uuid) to authenticated;

-- ============================================================
-- 10. Storage buckets for the logo and event banners
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('branding', 'branding', true, 2097152,
   array['image/png', 'image/jpeg', 'image/webp']),
  ('event-banners', 'event-banners', true, 2097152,
   array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "Admins can upload branding"
on storage.objects for insert to authenticated
with check (bucket_id = 'branding' and public.is_admin());

create policy "Admins can update branding"
on storage.objects for update to authenticated
using (bucket_id = 'branding' and public.is_admin())
with check (bucket_id = 'branding' and public.is_admin());

create policy "Admins can delete branding"
on storage.objects for delete to authenticated
using (bucket_id = 'branding' and public.is_admin());

create policy "Admins can upload event banners"
on storage.objects for insert to authenticated
with check (bucket_id = 'event-banners' and public.is_admin());

create policy "Admins can update event banners"
on storage.objects for update to authenticated
using (bucket_id = 'event-banners' and public.is_admin())
with check (bucket_id = 'event-banners' and public.is_admin());

create policy "Admins can delete event banners"
on storage.objects for delete to authenticated
using (bucket_id = 'event-banners' and public.is_admin());

commit;