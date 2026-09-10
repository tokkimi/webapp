-- Additive migration: private professional accounting, no changes to other roles.
begin;
create table if not exists public.pro_practice_settings (
  pro_id uuid primary key references public.profiles(id) on delete cascade,
  profession text not null default '' check (length(profession) <= 120),
  practice_name text not null default '' check (length(practice_name) <= 180),
  registration_number text not null default '' check (length(registration_number) <= 100),
  address text not null default '' check (length(address) <= 500),
  contact_email text not null default '' check (length(contact_email) <= 254),
  phone text not null default '' check (length(phone) <= 50),
  updated_at timestamptz not null default now()
);
create table if not exists public.pro_finance_entries (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('income', 'expense')),
  label text not null check (length(trim(label)) between 1 and 180),
  category text not null check (length(category) between 1 and 100),
  amount_cents bigint not null check (amount_cents between 1 and 999999999),
  tax_rate_bps integer not null default 0 check (tax_rate_bps between 0 and 10000),
  occurred_on date not null,
  paid_on date,
  report_date date generated always as (coalesce(paid_on, occurred_on)) stored,
  status text not null check (status in ('paid', 'pending', 'cancelled')),
  payment_method text not null default 'Virement',
  reference text not null default '' check (length(reference) <= 120),
  notes text not null default '' check (length(notes) <= 2000),
  receipt_path text,
  receipt_name text check (length(receipt_name) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'paid' and paid_on is not null) or (status <> 'paid' and paid_on is null)),
  check (receipt_path is null or split_part(receipt_path, '/', 1) = pro_id::text)
);
create index if not exists pro_finance_owner_date on public.pro_finance_entries(pro_id, report_date desc);
alter table public.pro_practice_settings enable row level security;
alter table public.pro_finance_entries enable row level security;
drop policy if exists pro_practice_owner on public.pro_practice_settings;
create policy pro_practice_owner on public.pro_practice_settings for all to authenticated
using (pro_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and profile_type = 'pro'))
with check (pro_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and profile_type = 'pro'));
drop policy if exists pro_finance_owner on public.pro_finance_entries;
create policy pro_finance_owner on public.pro_finance_entries for all to authenticated
using (pro_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and profile_type = 'pro'))
with check (pro_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and profile_type = 'pro'));
revoke all on public.pro_finance_entries, public.pro_practice_settings from anon;
grant select, insert, update on public.pro_finance_entries, public.pro_practice_settings to authenticated;
drop trigger if exists pro_finance_updated on public.pro_finance_entries;
create trigger pro_finance_updated before update on public.pro_finance_entries for each row execute procedure public.set_updated_at();
drop trigger if exists pro_practice_updated on public.pro_practice_settings;
create trigger pro_practice_updated before update on public.pro_practice_settings for each row execute procedure public.set_updated_at();
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('pro-receipts', 'pro-receipts', false, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists pro_receipts_read on storage.objects;
create policy pro_receipts_read on storage.objects for select to authenticated
using (bucket_id = 'pro-receipts' and (storage.foldername(name))[1] = auth.uid()::text and exists (select 1 from public.profiles where id = auth.uid() and profile_type = 'pro'));
drop policy if exists pro_receipts_insert on storage.objects;
create policy pro_receipts_insert on storage.objects for insert to authenticated
with check (bucket_id = 'pro-receipts' and (storage.foldername(name))[1] = auth.uid()::text and exists (select 1 from public.profiles where id = auth.uid() and profile_type = 'pro'));
commit;
