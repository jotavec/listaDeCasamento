-- Synthetic fixtures only. All data changes and session claims are rolled back.
begin;
select set_config('test.admin_id',(select user_id::text from private.authorized_users where enabled limit 1),true);
select set_config('test.report_id',gen_random_uuid()::text,true);
with fixture as (
  insert into public.gifts(title,price_cents,image_path) values ('Pix policy test',20000,gen_random_uuid()::text||'.webp') returning id
) select set_config('test.gift_id',(select id::text from fixture),true);
set local role anon;
select set_config('request.jwt.claims','{}',true);
insert into public.gift_payment_reports(id,gift_id,gift_title,amount_cents,guest_name,payer_name,pix_key,reference)
values (current_setting('test.report_id')::uuid,current_setting('test.gift_id')::uuid,'Pix policy test',20000,'Guest test','Payer test','test@example.com',left(replace(current_setting('test.report_id'),'-',''),25));
do $$ begin
  begin
    perform * from public.gift_payment_reports;
    raise exception 'Anonymous reports read allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.gift_payment_reports set status='confirmed';
    raise exception 'Anonymous confirmation allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.pix_settings set pix_key='attacker@example.com' where id=true;
    raise exception 'Anonymous destination change allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.gift_payment_reports(id,gift_title,amount_cents,guest_name,payer_name,pix_key,reference,status)
    values (gen_random_uuid(),'Invalid',100,'Guest test','Payer test','test@example.com','bad','confirmed');
    raise exception 'Guest forged status allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.gift_payment_reports(id,gift_id,gift_title,amount_cents,guest_name,payer_name,pix_key,reference)
    values (current_setting('test.report_id')::uuid,current_setting('test.gift_id')::uuid,'Pix policy test',20000,'Guest test','Payer test','test@example.com',left(replace(current_setting('test.report_id'),'-',''),25));
    raise exception 'Repeated report created a duplicate';
  exception when unique_violation then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',gen_random_uuid(),'aal','aal2','role','authenticated')::text,true);
do $$ begin
  if exists(select 1 from public.gift_payment_reports) then raise exception 'Unauthorized read allowed'; end if;
  update public.gift_payment_reports set status='confirmed';
  if found then raise exception 'Unauthorized confirmation allowed'; end if;
  update public.pix_settings set pix_key='attacker@example.com' where id=true;
  if found then raise exception 'Unauthorized destination change allowed'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin_id'),'aal','aal1','role','authenticated')::text,true);
do $$ begin
  if exists(select 1 from public.gift_payment_reports) then raise exception 'Admin without MFA read allowed'; end if;
  update public.gift_payment_reports set status='confirmed';
  if found then raise exception 'Admin without MFA confirmation allowed'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin_id'),'aal','aal2','role','authenticated')::text,true);
do $$ declare version timestamptz; row public.gift_payment_reports; begin
  select * into row from public.gift_payment_reports where id=current_setting('test.report_id')::uuid;
  if not found or row.status <> 'reported' or row.confirmed_at is not null then raise exception 'Guest report was confirmed prematurely'; end if;
  version := row.updated_at;
  update public.gift_payment_reports set status='confirmed' where id=row.id and updated_at=version returning * into row;
  if not found or row.confirmed_at is null or row.confirmed_by <> current_setting('test.admin_id')::uuid then raise exception 'Admin confirmation failed'; end if;
  update public.gift_payment_reports set status='not_found' where id=row.id and updated_at=version;
  if found then raise exception 'Stale status overwrite allowed'; end if;
  update public.gift_payment_reports set status='not_found' where id=row.id returning * into row;
  if row.confirmed_at is not null or row.confirmed_by is not null then raise exception 'Review reversal retained confirmation'; end if;
  begin
    update public.gift_payment_reports set amount_cents=1 where id=row.id;
    raise exception 'Payment snapshot overwrite allowed';
  exception when insufficient_privilege then null; end;
  delete from public.gifts where id=current_setting('test.gift_id')::uuid;
  select * into row from public.gift_payment_reports where id=current_setting('test.report_id')::uuid;
  if row.gift_id is not null or row.amount_cents<>20000 or row.gift_title<>'Pix policy test' then raise exception 'Catalog deletion lost payment history'; end if;
  update public.pix_settings set key_type='email',pix_key='test@example.com',receiver_name='Test Receiver',receiver_city='Goiania',enabled=true where id=true;
  if not found then raise exception 'Admin Pix settings update failed'; end if;
end $$;
set local role anon;
do $$ begin
  if not exists(select 1 from public.pix_settings where enabled and pix_key='test@example.com') then raise exception 'Enabled destination not public'; end if;
end $$;
rollback;
select 'PASS: reports private, only MFA admins reconcile, snapshots retained, duplicates/stale edits blocked; fixtures rolled back' as result;
