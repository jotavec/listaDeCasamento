alter table public.invitations
add column if not exists rsvptoken uuid default gen_random_uuid();

update public.invitations
set rsvptoken = gen_random_uuid()
where rsvptoken is null;

alter table public.invitations
alter column rsvptoken set not null;

create unique index if not exists invitationsrsvptokenindex
on public.invitations (rsvptoken);


create or replace function public.find_rsvp_invitation(
  p_name text
)
returns table (
  invitation_id uuid,
  primary_name text,
  max_adults smallint,
  rsvp_status text,
  rsvp_token uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  if p_name is null or char_length(trim(p_name)) < 2 then
    return;
  end if;

  v_name :=
    translate(
      lower(
        regexp_replace(
          trim(p_name),
          '\s+',
          ' ',
          'g'
        )
      ),
      'áàâãäéèêëíìîïóòôõöúùûüç',
      'aaaaaeeeeiiiiooooouuuuc'
    );

  return query
  select
    i.id,
    i.primaryname,
    i.maxadults,
    i.rsvpstatus,
    i.rsvptoken
  from public.invitations i
  where
    translate(
      lower(
        regexp_replace(
          trim(i.primaryname),
          '\s+',
          ' ',
          'g'
        )
      ),
      'áàâãäéèêëíìîïóòôõöúùûüç',
      'aaaaaeeeeiiiiooooouuuuc'
    ) = v_name
  limit 2;
end;
$$;

revoke all on function public.find_rsvp_invitation(text)
from public;

grant execute
on function public.find_rsvp_invitation(text)
to anon;


create or replace function public.confirm_rsvp(
  p_invitation_id uuid,
  p_token uuid,
  p_attending boolean,
  p_companions jsonb default '[]'::jsonb,
  p_children jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_max_adults integer;
  v_companion_count integer;
  v_children_count integer;
  v_item jsonb;
  v_name text;
  v_age integer;
begin
  select i.maxadults
  into v_max_adults
  from public.invitations i
  where
    i.id = p_invitation_id
    and i.rsvptoken = p_token;

  if not found then
    raise exception 'Convite inválido.';
  end if;

  if jsonb_typeof(p_companions) <> 'array'
     or jsonb_typeof(p_children) <> 'array' then
    raise exception 'Dados inválidos.';
  end if;

  v_companion_count := jsonb_array_length(p_companions);
  v_children_count := jsonb_array_length(p_children);

  if v_companion_count > v_max_adults then
    raise exception 'Quantidade de acompanhantes excedida.';
  end if;

  if v_children_count > 50 then
    raise exception 'Quantidade de crianças inválida.';
  end if;

  if p_attending = false then
    if v_companion_count <> 0 or v_children_count <> 0 then
      raise exception 'Confirmação inválida.';
    end if;

    delete from public.companions
    where invitationid = p_invitation_id;

    delete from public.children
    where invitationid = p_invitation_id;

    update public.invitations
    set
      rsvpstatus = 'declined',
      primaryattending = false,
      confirmedat = now(),
      updatedat = now()
    where id = p_invitation_id;

    return;
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_companions)
  loop
    v_name := trim(v_item #>> '{}');

    if char_length(v_name) < 2
       or char_length(v_name) > 120 then
      raise exception 'Nome de acompanhante inválido.';
    end if;
  end loop;

  for v_item in
    select value
    from jsonb_array_elements(p_children)
  loop
    v_name := trim(v_item ->> 'name');

    begin
      v_age := (v_item ->> 'age')::integer;
    exception
      when others then
        raise exception 'Idade da criança inválida.';
    end;

    if char_length(v_name) < 2
       or char_length(v_name) > 120 then
      raise exception 'Nome da criança inválido.';
    end if;

    if v_age < 0 or v_age > 10 then
      raise exception 'Idade da criança inválida.';
    end if;
  end loop;

  delete from public.companions
  where invitationid = p_invitation_id;

  delete from public.children
  where invitationid = p_invitation_id;

  insert into public.companions (
    invitationid,
    name
  )
  select
    p_invitation_id,
    trim(value #>> '{}')
  from jsonb_array_elements(p_companions);

  insert into public.children (
    invitationid,
    name,
    age
  )
  select
    p_invitation_id,
    trim(value ->> 'name'),
    (value ->> 'age')::integer
  from jsonb_array_elements(p_children);

  update public.invitations
  set
    rsvpstatus = 'confirmed',
    primaryattending = true,
    confirmedat = now(),
    updatedat = now()
  where id = p_invitation_id;
end;
$$;

revoke all on function public.confirm_rsvp(
  uuid,
  uuid,
  boolean,
  jsonb,
  jsonb
)
from public;

grant execute
on function public.confirm_rsvp(
  uuid,
  uuid,
  boolean,
  jsonb,
  jsonb
)
to anon;
