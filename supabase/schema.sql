-- Capsule database schema
-- Safe to run more than once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  profile_type text not null default 'ado' check (profile_type in ('ado', 'parent', 'pro', 'admin', 'superadmin')),
  verified boolean not null default false,
  avatar_url text,
  bio text,
  location text,
  phone text,
  birth_date date,
  checkin_parental boolean not null default false,
  share_mood boolean not null default false,
  specialty text,
  adeli_number text,
  years_experience integer,
  age_range text,
  consultation_types text[] default '{}',
  price_min integer,
  price_max integer,
  public_description text,
  public_consultation_types text[] default '{}',
  public_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists updated_at timestamptz default now();
alter table public.profiles add column if not exists checkin_parental boolean default false;
alter table public.profiles add column if not exists share_mood boolean default false;
alter table public.profiles add column if not exists years_experience integer;
alter table public.profiles add column if not exists age_range text;
alter table public.profiles add column if not exists consultation_types text[] default '{}';
alter table public.profiles add column if not exists price_min integer;
alter table public.profiles add column if not exists price_max integer;
alter table public.profiles add column if not exists public_description text;
alter table public.profiles add column if not exists public_consultation_types text[] default '{}';
alter table public.profiles add column if not exists public_location text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, profile_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'profile_type', 'ado')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(public.profiles.name, excluded.name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of raw_user_meta_data on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email, name, profile_type)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'profile_type', 'ado')
from auth.users u
on conflict (id) do update set
  email = excluded.email,
  name = coalesce(public.profiles.name, excluded.name),
  profile_type = coalesce(public.profiles.profile_type, excluded.profile_type);

update public.profiles set verified = true where email = 'test-pro@capsule.app';

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  mood integer,
  mood_score integer,
  drawing_data text,
  ai_response text,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score between 1 and 10),
  emoji text,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  category text not null default 'bien-etre',
  target_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  total_streak integer not null default 0,
  check_ins jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint valid_slot_duration check (ends_at > starts_at),
  unique (pro_id, starts_at)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  pro_id uuid not null references public.profiles(id) on delete cascade,
  availability_slot_id uuid references public.availability_slots(id) on delete set null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 50,
  type text not null default 'video' check (type in ('video', 'phone', 'in_person')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes_for_pro text,
  pro_notes text,
  meeting_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  pro_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create or replace function public.book_appointment(
  requested_slot uuid,
  requested_type text default 'video',
  requested_notes text default null
)
returns public.appointments
language plpgsql
security definer set search_path = public
as $$
declare
  slot public.availability_slots;
  booked public.appointments;
begin
  select * into slot
  from public.availability_slots
  where id = requested_slot and is_booked = false and starts_at > now()
  for update;

  if slot.id is null then
    raise exception 'Ce creneau n''est plus disponible';
  end if;
  if slot.pro_id = auth.uid() then
    raise exception 'Un professionnel ne peut pas se reserver lui-meme';
  end if;

  insert into public.appointments (
    patient_id, pro_id, availability_slot_id, scheduled_at,
    duration_minutes, type, notes_for_pro
  ) values (
    auth.uid(), slot.pro_id, slot.id, slot.starts_at,
    greatest(15, extract(epoch from (slot.ends_at - slot.starts_at)) / 60)::integer,
    requested_type, nullif(trim(requested_notes), '')
  )
  returning * into booked;

  update public.availability_slots set is_booked = true where id = slot.id;
  return booked;
end;
$$;

create or replace function public.is_conversation_member(requested_conversation uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = requested_conversation and user_id = auth.uid()
  );
$$;

create or replace function public.shares_conversation(other_user uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members mine
    join public.conversation_members theirs
      on theirs.conversation_id = mine.conversation_id
    where mine.user_id = auth.uid() and theirs.user_id = other_user
  );
$$;

create or replace function public.create_appointment_conversation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare conversation_uuid uuid;
begin
  insert into public.conversations (appointment_id) values (new.id) returning id into conversation_uuid;
  insert into public.conversation_members (conversation_id, user_id)
  values (conversation_uuid, new.patient_id), (conversation_uuid, new.pro_id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists appointment_conversation on public.appointments;
create trigger appointment_conversation
  after insert on public.appointments
  for each row execute procedure public.create_appointment_conversation();

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  motivation boolean not null default true,
  journal boolean not null default true,
  messages boolean not null default true,
  rdv boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.family_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.profiles(id) on delete cascade,
  ado_id uuid references public.profiles(id) on delete cascade,
  invite_code text unique,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text,
  type text,
  category text,
  tags text[] default '{}',
  target_profile text default 'all',
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  profile_type text,
  consent_at timestamptz,
  active boolean not null default true,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers add column if not exists name text;
alter table public.newsletter_subscribers add column if not exists profile_type text;
alter table public.newsletter_subscribers add column if not exists consent_at timestamptz;
alter table public.newsletter_subscribers add column if not exists active boolean default true;
alter table public.newsletter_subscribers add column if not exists unsubscribed_at timestamptz;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text default 'info',
  read boolean not null default false,
  data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text not null default 'inactive',
  plan_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_motivations (
  id uuid primary key default gen_random_uuid(),
  generated_date date not null unique,
  content text not null,
  author_style text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_motivations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  motivation_id uuid not null references public.daily_motivations(id) on delete cascade,
  liked boolean not null,
  created_at timestamptz not null default now(),
  unique (user_id, motivation_id)
);

create table if not exists public.ai_config (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  gender text,
  personality text,
  hair text,
  eyes text,
  build text,
  style text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resources add column if not exists created_by uuid references public.profiles(id) on delete set null;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and profile_type in ('admin', 'superadmin')
  );
$$;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public, auth
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avatars_public_read on storage.objects;
drop policy if exists avatars_own_insert on storage.objects;
drop policy if exists avatars_own_update on storage.objects;
drop policy if exists avatars_own_delete on storage.objects;
create policy avatars_public_read on storage.objects for select using (bucket_id = 'avatars');
create policy avatars_own_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_own_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_own_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace view public.public_professionals as
select
  p.id,
  p.name,
  p.avatar_url,
  p.specialty,
  coalesce(p.public_description, p.bio) as bio,
  coalesce(p.public_location, p.location) as location,
  coalesce(p.public_consultation_types, p.consultation_types) as consultation_types,
  p.years_experience,
  p.age_range,
  p.price_min,
  p.price_max,
  p.verified,
  coalesce(round(avg(r.score)::numeric, 1), 0) as rating,
  count(r.id)::integer as rating_count
from public.profiles p
left join public.ratings r on r.pro_id = p.id
where p.profile_type = 'pro' and p.verified = true
group by p.id;

alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.mood_entries enable row level security;
alter table public.challenges enable row level security;
alter table public.availability_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.ratings enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.family_links enable row level security;
alter table public.resources enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.daily_motivations enable row level security;
alter table public.user_motivations enable row level security;
alter table public.ai_config enable row level security;

do $$
declare policy_row record;
begin
  for policy_row in select schemaname, tablename, policyname from pg_policies where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end $$;

create policy profiles_own_select on public.profiles for select using (
  auth.uid() = id
  or public.is_admin()
  or exists (
    select 1 from public.appointments a
    where (a.patient_id = auth.uid() and a.pro_id = profiles.id)
       or (a.pro_id = auth.uid() and a.patient_id = profiles.id)
  )
  or exists (
    select 1 from public.family_links f
    where f.status = 'active'
      and ((f.parent_id = auth.uid() and f.ado_id = profiles.id)
        or (f.ado_id = auth.uid() and f.parent_id = profiles.id))
  )
  or public.shares_conversation(profiles.id)
);
create policy profiles_own_insert on public.profiles for insert with check (auth.uid() = id);
create policy profiles_own_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy profiles_admin_update on public.profiles for update using (public.is_admin()) with check (public.is_admin());
create policy profiles_own_delete on public.profiles for delete using (auth.uid() = id);

create policy journal_own_all on public.journal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy moods_own_all on public.mood_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy challenges_own_all on public.challenges for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy preferences_own_all on public.notification_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy slots_public_read on public.availability_slots for select using (
  (is_booked = false and starts_at > now()) or auth.uid() = pro_id
);
create policy slots_pro_insert on public.availability_slots for insert with check (auth.uid() = pro_id);
create policy slots_pro_update on public.availability_slots for update using (auth.uid() = pro_id) with check (auth.uid() = pro_id);
create policy slots_patient_release on public.availability_slots for update
  using (exists (
    select 1 from public.appointments a
    where a.availability_slot_id = availability_slots.id
      and a.patient_id = auth.uid()
      and a.status = 'cancelled'
  ))
  with check (exists (
    select 1 from public.appointments a
    where a.availability_slot_id = availability_slots.id
      and a.patient_id = auth.uid()
      and a.status = 'cancelled'
  ));
create policy slots_pro_delete on public.availability_slots for delete using (auth.uid() = pro_id);

create policy appointments_members_read on public.appointments for select using (auth.uid() in (patient_id, pro_id));
create policy appointments_patient_insert on public.appointments for insert with check (auth.uid() = patient_id and patient_id <> pro_id);
create policy appointments_members_update on public.appointments for update using (auth.uid() in (patient_id, pro_id));
create policy appointments_members_delete on public.appointments for delete using (auth.uid() in (patient_id, pro_id));

create policy conversations_members_read on public.conversations for select using (
  public.is_conversation_member(id)
);
create policy conversations_authenticated_insert on public.conversations for insert to authenticated with check (true);
create policy conversation_members_read on public.conversation_members for select using (
  public.is_conversation_member(conversation_id)
);
create policy conversation_members_insert on public.conversation_members for insert to authenticated with check (
  user_id = auth.uid() or exists (
    select 1 from public.appointments a
    where a.id = (select c.appointment_id from public.conversations c where c.id = conversation_id)
      and auth.uid() in (a.patient_id, a.pro_id)
      and user_id in (a.patient_id, a.pro_id)
  )
);
create policy messages_members_read on public.messages for select using (
  public.is_conversation_member(messages.conversation_id)
);
create policy messages_members_insert on public.messages for insert with check (
  sender_id = auth.uid()
  and public.is_conversation_member(messages.conversation_id)
);
create policy messages_sender_delete on public.messages for delete using (sender_id = auth.uid());

create policy ratings_public_read on public.ratings for select using (true);
create policy ratings_patient_insert on public.ratings for insert with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.appointments a
    where a.id = appointment_id and a.patient_id = auth.uid() and a.pro_id = pro_id and a.status = 'completed'
  )
);

create policy family_members_all on public.family_links for all
  using (auth.uid() in (parent_id, ado_id))
  with check (auth.uid() in (parent_id, ado_id));
create policy family_ado_claim on public.family_links for update
  using (ado_id is null and status = 'pending')
  with check (ado_id = auth.uid() and status = 'active');
create policy resources_read on public.resources for select using (approved = true);
create policy resources_pro_admin_read on public.resources for select using (
  public.is_admin() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.profile_type = 'pro')
);
create policy resources_pro_admin_insert on public.resources for insert with check (
  created_by = auth.uid() and (
    public.is_admin() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.profile_type = 'pro')
  )
);
create policy resources_owner_admin_update on public.resources for update using (created_by = auth.uid() or public.is_admin());
create policy resources_owner_admin_delete on public.resources for delete using (created_by = auth.uid() or public.is_admin());
create policy newsletter_signup on public.newsletter_subscribers for insert with check (true);
create policy newsletter_admin_read on public.newsletter_subscribers for select using (public.is_admin());
create policy newsletter_public_unsubscribe on public.newsletter_subscribers for update using (true) with check (true);
create policy notifications_own_all on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy subscriptions_own_read on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
create policy motivations_authenticated_read on public.daily_motivations for select to authenticated using (true);
create policy motivations_authenticated_insert on public.daily_motivations for insert to authenticated with check (true);
create policy user_motivations_own_all on public.user_motivations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ai_config_own_all on public.ai_config for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy appointments_admin_read on public.appointments for select using (public.is_admin());

grant select on public.public_professionals to anon, authenticated;
grant execute on function public.book_appointment(uuid, text, text) to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.shares_conversation(uuid) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.delete_own_account() to authenticated;
grant all on public.profiles, public.journal_entries, public.mood_entries, public.challenges,
  public.availability_slots, public.appointments, public.conversations, public.conversation_members,
  public.messages, public.ratings, public.notification_preferences, public.family_links,
  public.resources, public.newsletter_subscribers, public.notifications, public.subscriptions,
  public.daily_motivations, public.user_motivations, public.ai_config to authenticated;
grant select on public.resources to anon;
grant insert on public.newsletter_subscribers to anon;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists challenges_updated_at on public.challenges;
create trigger challenges_updated_at before update on public.challenges for each row execute procedure public.set_updated_at();
drop trigger if exists appointments_updated_at on public.appointments;
create trigger appointments_updated_at before update on public.appointments for each row execute procedure public.set_updated_at();
drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at before update on public.conversations for each row execute procedure public.set_updated_at();
drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.set_updated_at();
drop trigger if exists ai_config_updated_at on public.ai_config;
create trigger ai_config_updated_at before update on public.ai_config for each row execute procedure public.set_updated_at();
