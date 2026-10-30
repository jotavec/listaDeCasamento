-- Direct Pix details, intentionally public only while enabled. No gateway credentials.
create table public.pix_settings (
  id boolean primary key default true check (id),
  key_type text not null default 'random' check (key_type in ('random','email','cpf','cnpj','phone')),
  pix_key text not null default '' check (char_length(pix_key) <= 77),
  receiver_name text not null default '' check (char_length(receiver_name) <= 120),
  receiver_city text not null default '' check (char_length(receiver_city) <= 80),
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint pix_enabled_requires_destination check (not enabled or (length(trim(pix_key)) > 0 and length(trim(receiver_name)) > 0 and length(trim(receiver_city)) > 0))
);
insert into public.pix_settings (id) values (true);
alter table public.pix_settings enable row level security;
revoke all on public.pix_settings from anon, authenticated;
grant select on public.pix_settings to anon, authenticated;
grant update (key_type,pix_key,receiver_name,receiver_city,enabled) on public.pix_settings to authenticated;
create policy "Public enabled Pix destination" on public.pix_settings for select to anon using (enabled);
create policy "Enabled destination or verified admin" on public.pix_settings for select to authenticated using (enabled or (select public.can_access_sensitive_data()));
create policy "Verified admins configure Pix" on public.pix_settings for update to authenticated
  using ((select public.can_access_sensitive_data())) with check ((select public.can_access_sensitive_data()));
create trigger pix_settings_updated_at before update on public.pix_settings for each row execute function public.touch_gift_updated_at();

-- A guest's statement is NOT a bank confirmation. Only verified admins may change status.
-- Snapshot fields preserve what was shown even if the catalog or destination is edited later.
create table public.gift_payment_reports (
  id uuid primary key,
  gift_id uuid references public.gifts(id) on delete set null,
  gift_title text not null check (char_length(trim(gift_title)) between 2 and 120),
  amount_cents integer not null check (amount_cents between 1 and 100000000),
  guest_name text not null check (char_length(trim(guest_name)) between 2 and 120),
  payer_name text not null check (char_length(trim(payer_name)) between 2 and 120),
  pix_key text not null check (char_length(pix_key) between 1 and 77),
  reference text not null check (reference = left(replace(id::text,'-',''),25)),
  status text not null default 'reported' check (status in ('reported','confirmed','not_found')),
  reported_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid,
  updated_at timestamptz not null default now(),
  constraint gift_report_confirmation_consistent check (
    (status = 'confirmed' and confirmed_at is not null and confirmed_by is not null)
    or (status <> 'confirmed' and confirmed_at is null and confirmed_by is null)
  )
);
create index gift_reports_status_reported_idx on public.gift_payment_reports (status,reported_at desc,id);
create index gift_reports_reported_idx on public.gift_payment_reports (reported_at desc,id);
create index gift_reports_gift_idx on public.gift_payment_reports (gift_id);
alter table public.gift_payment_reports enable row level security;
revoke all on public.gift_payment_reports from anon, authenticated;
grant insert (id,gift_id,gift_title,amount_cents,guest_name,payer_name,pix_key,reference) on public.gift_payment_reports to anon, authenticated;
grant select on public.gift_payment_reports to authenticated;
grant update (status) on public.gift_payment_reports to authenticated;
create policy "Guests can only report payments" on public.gift_payment_reports for insert to anon, authenticated
  with check (status = 'reported' and confirmed_at is null and confirmed_by is null);
create policy "Only verified admins read payment reports" on public.gift_payment_reports for select to authenticated
  using ((select public.can_access_sensitive_data()));
create policy "Only verified admins reconcile payments" on public.gift_payment_reports for update to authenticated
  using ((select public.can_access_sensitive_data())) with check ((select public.can_access_sensitive_data()));

create function public.stamp_gift_payment_review() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'confirmed' then
      new.confirmed_at := clock_timestamp();
      new.confirmed_by := auth.uid();
    else
      new.confirmed_at := null;
      new.confirmed_by := null;
    end if;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.stamp_gift_payment_review() from public, anon, authenticated;
create trigger gift_payment_review before update on public.gift_payment_reports for each row execute function public.stamp_gift_payment_review();
