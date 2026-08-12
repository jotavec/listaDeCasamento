create or replace function public.suggest_rsvp_invitations(
  p_query text
)
returns table (
  primary_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select i.primaryname
  from public.invitations i
  where
    char_length(trim(p_query)) >= 3
    and translate(
      lower(i.primaryname),
      'áàâãäéèêëíìîïóòôõöúùûüç',
      'aaaaaeeeeiiiiooooouuuuc'
    )
    like
    '%' ||
    translate(
      lower(trim(p_query)),
      'áàâãäéèêëíìîïóòôõöúùûüç',
      'aaaaaeeeeiiiiooooouuuuc'
    )
    || '%'
  order by i.primaryname
  limit 8;
$$;

revoke all
on function public.suggest_rsvp_invitations(text)
from public;

grant execute
on function public.suggest_rsvp_invitations(text)
to anon;
