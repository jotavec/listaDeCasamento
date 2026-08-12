create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  primaryname text not null check (char_length(trim(primaryname)) between 2 and 120),
  maxadults smallint not null default 0 check (maxadults between 0 and 20),
  rsvpstatus text not null default 'pending'
    check (rsvpstatus in ('pending', 'confirmed', 'declined')),
  primaryattending boolean,
  confirmedat timestamptz,
  notes text,
  createdby uuid not null default auth.uid() references auth.users(id),
  createdat timestamptz not null default now(),
  updatedat timestamptz not null default now()
);

create table if not exists public.companions (
  id uuid primary key default gen_random_uuid(),
  invitationid uuid not null references public.invitations(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 120),
  createdat timestamptz not null default now()
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  invitationid uuid not null references public.invitations(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 120),
  age smallint not null check (age between 0 and 10),
  createdat timestamptz not null default now()
);

alter table public.invitations enable row level security;
alter table public.companions enable row level security;
alter table public.children enable row level security;

revoke all on table public.invitations from public;
revoke all on table public.invitations from anon;
revoke all on table public.invitations from authenticated;

revoke all on table public.companions from public;
revoke all on table public.companions from anon;
revoke all on table public.companions from authenticated;

revoke all on table public.children from public;
revoke all on table public.children from anon;
revoke all on table public.children from authenticated;

grant select, insert, update, delete on table public.invitations to authenticated;
grant select, insert, update, delete on table public.companions to authenticated;
grant select, insert, update, delete on table public.children to authenticated;

drop policy if exists "Admin invitations" on public.invitations;
create policy "Admin invitations"
on public.invitations
for all
to authenticated
using (public.can_access_sensitive_data())
with check (public.can_access_sensitive_data());

drop policy if exists "Admin companions" on public.companions;
create policy "Admin companions"
on public.companions
for all
to authenticated
using (public.can_access_sensitive_data())
with check (public.can_access_sensitive_data());

drop policy if exists "Admin children" on public.children;
create policy "Admin children"
on public.children
for all
to authenticated
using (public.can_access_sensitive_data())
with check (public.can_access_sensitive_data());

create index if not exists invitationsnameindex
on public.invitations (lower(primaryname));

create index if not exists invitationsstatusindex
on public.invitations (rsvpstatus);

create index if not exists companionsinvitationindex
on public.companions (invitationid);

create index if not exists childreninvitationindex
on public.children (invitationid);
