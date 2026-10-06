-- Public catalog contains only intentionally public gift information.
create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (title = btrim(title) and char_length(title) between 2 and 120),
  price_cents integer not null check (price_cents between 1 and 100000000),
  image_path text not null unique check (image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gifts_created_at_id_idx on public.gifts (created_at desc, id);
alter table public.gifts enable row level security;
revoke all on public.gifts from anon, authenticated;
grant select on public.gifts to anon, authenticated;
grant insert (title,price_cents,image_path), update (title,price_cents,image_path), delete on public.gifts to authenticated;
create policy "Anyone can view the gift catalog" on public.gifts for select to anon, authenticated using (true);
create policy "Verified admins can create gifts" on public.gifts for insert to authenticated with check ((select public.can_access_sensitive_data()));
create policy "Verified admins can update gifts" on public.gifts for update to authenticated using ((select public.can_access_sensitive_data())) with check ((select public.can_access_sensitive_data()));
create policy "Verified admins can delete gifts" on public.gifts for delete to authenticated using ((select public.can_access_sensitive_data()));
create function public.touch_gift_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.touch_gift_updated_at() from public, anon, authenticated;
create trigger gifts_updated_at before update on public.gifts for each row execute function public.touch_gift_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gift-images', 'gift-images', true, 2097152, array['image/webp']);
create policy "Verified admins can read gift photo records" on storage.objects for select to authenticated
using (bucket_id = 'gift-images' and (select public.can_access_sensitive_data()));
create policy "Verified admins can upload gift photos" on storage.objects for insert to authenticated
with check (bucket_id = 'gift-images' and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$' and (select public.can_access_sensitive_data()));
create policy "Verified admins can delete gift photos" on storage.objects for delete to authenticated
using (bucket_id = 'gift-images' and (select public.can_access_sensitive_data()));
