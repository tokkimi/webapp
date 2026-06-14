-- Capsule manager backend additions. This migration is additive and preserves existing data.

alter table public.profiles add column if not exists verification_status text default 'pending';
alter table public.profiles add column if not exists verification_notes text;
alter table public.profiles add column if not exists verification_documents jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists verified_at timestamptz;

alter table public.resources add column if not exists file_url text;
alter table public.resources add column if not exists file_name text;
alter table public.resources add column if not exists file_size bigint;

create table if not exists public.page_visits (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  session_id text,
  user_id uuid references public.profiles(id) on delete set null,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists page_visits_created_at_idx on public.page_visits(created_at desc);
create index if not exists page_visits_path_idx on public.page_visits(path);

alter table public.page_visits enable row level security;

drop policy if exists page_visits_public_insert on public.page_visits;
create policy page_visits_public_insert
  on public.page_visits for insert
  with check (true);

drop policy if exists page_visits_admin_read on public.page_visits;
create policy page_visits_admin_read
  on public.page_visits for select
  using (public.is_admin());

grant insert on public.page_visits to anon, authenticated;
grant select on public.page_visits to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resources',
  'resources',
  true,
  52428800,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', 'video/mp4']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists resources_files_public_read on storage.objects;
create policy resources_files_public_read
  on storage.objects for select
  using (bucket_id = 'resources');

drop policy if exists resources_files_admin_insert on storage.objects;
create policy resources_files_admin_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'resources' and public.is_admin());

drop policy if exists resources_files_admin_update on storage.objects;
create policy resources_files_admin_update
  on storage.objects for update to authenticated
  using (bucket_id = 'resources' and public.is_admin())
  with check (bucket_id = 'resources' and public.is_admin());

drop policy if exists resources_files_admin_delete on storage.objects;
create policy resources_files_admin_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'resources' and public.is_admin());

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
    case
      when new.raw_user_meta_data->>'profile_type' in ('ado', 'parent', 'pro')
        then new.raw_user_meta_data->>'profile_type'
      else 'ado'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
