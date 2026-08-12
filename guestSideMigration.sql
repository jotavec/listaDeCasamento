alter table public.invitations
add column if not exists side text;

alter table public.invitations
drop constraint if exists invitations_side_check;

alter table public.invitations
add constraint invitations_side_check
check (side is null or side in ('bride', 'groom'));

create index if not exists invitationssideindex
on public.invitations (side);
