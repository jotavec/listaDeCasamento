-- Run as the project administrator. All synthetic data is rolled back.
begin;
do $test$
declare
  invitation uuid;
  token uuid;
  rejected boolean;
begin
  insert into public.invitations(primaryname,maxadults,side,createdby)
  select 'Zz Auditoria Segurança',1,'bride',user_id
  from private.authorized_users where enabled=true limit 1
  returning id,rsvptoken into invitation,token;
  assert invitation is not null, 'An authorized administrator is required';
  assert (select count(*) from public.find_rsvp_invitation('  Zz  Auditoria Seguranca  '))=1, 'Exact normalized lookup';
  assert (select count(*) from public.suggest_rsvp_invitations('%%%'))=0, 'Wildcards must be literal';
  assert (select count(*) from public.suggest_rsvp_invitations('auditoria'))=1, 'Valid suggestions';
  assert not has_table_privilege('anon','public.invitations','select'), 'Anonymous table reads denied';
  assert has_function_privilege('anon','public.confirm_rsvp(uuid,uuid,boolean,jsonb,jsonb)','execute'), 'Guest RPC available';

  rejected := false;
  begin
    perform public.confirm_rsvp(invitation,token,null,'[]','[]');
  exception when raise_exception then rejected := true;
  end;
  assert rejected, 'Null attending rejected';
  rejected := false;
  begin
    perform public.confirm_rsvp(invitation,token,true,'[null]','[]');
  exception when raise_exception then rejected := true;
  end;
  assert rejected, 'Null companion rejected';
  rejected := false;
  begin
    perform public.confirm_rsvp(invitation,token,true,'[]','[{"name":"Teste","age":null}]');
  exception when raise_exception then rejected := true;
  end;
  assert rejected, 'Null child age rejected';
  rejected := false;
  begin
    perform public.confirm_rsvp(invitation,gen_random_uuid(),true,'[]','[]');
  exception when raise_exception then rejected := true;
  end;
  assert rejected, 'Wrong invitation token rejected';
  rejected := false;
  begin
    perform public.confirm_rsvp(invitation,token,true,'["Pessoa Um","Pessoa Dois"]','[]');
  exception when raise_exception then rejected := true;
  end;
  assert rejected, 'Capacity enforced';

  perform public.confirm_rsvp(invitation,token,true,'["Pessoa Teste"]','[{"name":"Crianca Teste","age":5}]');
  assert (select rsvpstatus from public.invitations where id=invitation)='confirmed', 'Confirmation recorded';
  assert (select count(*) from public.companions where invitationid=invitation)=1, 'Companion recorded';
  assert (select count(*) from public.children where invitationid=invitation)=1, 'Child recorded';
  perform public.confirm_rsvp(invitation,token,false,'[]','[]');
  assert (select rsvpstatus from public.invitations where id=invitation)='declined', 'Decline recorded';
  assert (select count(*) from public.companions where invitationid=invitation)=0, 'Companions reconciled';
  assert (select count(*) from public.children where invitationid=invitation)=0, 'Children reconciled';
end;
$test$;
select 'RSVP security and confirmation checks passed; synthetic data rolled back' as result;
rollback;

