-- All fixtures and session claims are rolled back; no real records are changed.
begin;
select set_config('test.admin_id', (select user_id::text from private.authorized_users where enabled limit 1), true);
with fixture as (
 insert into public.gifts (title,price_cents,image_path)
 values ('Temporary policy test',100,gen_random_uuid()::text || '.webp') returning id
) select set_config('test.gift_id',(select id::text from fixture),true);
set local role anon;
select set_config('request.jwt.claims','{}',true);
do $$ begin
 if not exists(select 1 from public.gifts where id=current_setting('test.gift_id')::uuid) then raise exception 'Public catalog not readable'; end if;
 begin
  insert into public.gifts(title,price_cents,image_path) values ('Unauthorized',100,gen_random_uuid()::text || '.webp');
  raise exception 'Anonymous insert unexpectedly succeeded';
 exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',gen_random_uuid(),'aal','aal2','role','authenticated')::text,true);
do $$ begin
 begin
  insert into public.gifts(title,price_cents,image_path) values ('Unauthorized',100,gen_random_uuid()::text || '.webp');
  raise exception 'Unapproved user insert unexpectedly succeeded';
 exception when insufficient_privilege then null; end;
 update public.gifts set title='Unauthorized' where id=current_setting('test.gift_id')::uuid;
 if found then raise exception 'Unapproved update unexpectedly succeeded'; end if;
 delete from public.gifts where id=current_setting('test.gift_id')::uuid;
 if found then raise exception 'Unapproved delete unexpectedly succeeded'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin_id'),'aal','aal1','role','authenticated')::text,true);
do $$ begin
 begin
  insert into public.gifts(title,price_cents,image_path) values ('Unauthorized',100,gen_random_uuid()::text || '.webp');
  raise exception 'Admin without MFA insert unexpectedly succeeded';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin_id'),'aal','aal2','role','authenticated')::text,true);
do $$ declare gift_id uuid; old_version timestamptz; new_version timestamptz; begin
 insert into public.gifts(title,price_cents,image_path) values ('Approved test',25050,gen_random_uuid()::text || '.webp') returning id,updated_at into gift_id,old_version;
 update public.gifts set title='Edited test',price_cents=9900 where id=gift_id and updated_at=old_version returning updated_at into new_version;
 if not found or new_version=old_version then raise exception 'Admin update/version failed'; end if;
 update public.gifts set title='Stale overwrite' where id=gift_id and updated_at=old_version;
 if found then raise exception 'Stale edit unexpectedly succeeded'; end if;
 delete from public.gifts where id=gift_id and updated_at=new_version;
 if not found then raise exception 'Admin delete failed'; end if;
end $$;
rollback;
select 'PASS: anonymous read; anonymous/unapproved/non-MFA writes denied; verified admin CRUD; concurrent edits protected; fixtures rolled back' as result;
