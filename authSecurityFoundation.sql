create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create table if not exists private.authorized_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  label text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table private.authorized_users enable row level security;

revoke all on table private.authorized_users from public;
revoke all on table private.authorized_users from anon;
revoke all on table private.authorized_users from authenticated;

create or replace function public.is_authorized_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and coalesce(
      ((select auth.jwt())->>'is_anonymous')::boolean,
      false
    ) = false
    and exists (
      select 1
      from private.authorized_users au
      where au.user_id = (select auth.uid())
        and au.enabled = true
    );
$$;

revoke all on function public.is_authorized_user() from public;
revoke all on function public.is_authorized_user() from anon;
grant execute on function public.is_authorized_user() to authenticated;

create or replace function public.can_access_sensitive_data()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_authorized_user()
    and coalesce(
      (select auth.jwt()->>'aal'),
      'aal1'
    ) = 'aal2';
$$;

revoke all on function public.can_access_sensitive_data() from public;
revoke all on function public.can_access_sensitive_data() from anon;
grant execute on function public.can_access_sensitive_data() to authenticated;
