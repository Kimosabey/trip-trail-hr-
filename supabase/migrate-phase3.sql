-- TripTrail — Phase 3 migration. Run ONCE in the Supabase SQL Editor.
-- Adds: receipts storage + RLS. (Later sections for users/profile/grades/notifications are
-- appended as those features ship.)

-- ============================================================
-- 1) RECEIPTS — table RLS + private Storage bucket + object policies
-- ============================================================

-- receipts table RLS: use can_see_claim (not can_edit_claim) so evidence can be attached
-- after a claim is submitted. Replaces the original rc_write policy.
alter table public.receipts enable row level security;
drop policy if exists rc_write  on public.receipts;
drop policy if exists rc_read   on public.receipts;
drop policy if exists rc_insert on public.receipts;
drop policy if exists rc_delete on public.receipts;
create policy rc_read   on public.receipts for select using (public.can_see_claim(claim_id));
create policy rc_insert on public.receipts for insert with check (public.can_see_claim(claim_id));
create policy rc_delete on public.receipts for delete using (public.can_see_claim(claim_id));

-- private storage bucket for the actual files
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- storage object policies. Files are stored at  claims/<claim_id>/<filename>,
-- so split_part(name,'/',2) = the claim id → reuse can_see_claim().
drop policy if exists "receipts_obj_read"   on storage.objects;
drop policy if exists "receipts_obj_insert" on storage.objects;
drop policy if exists "receipts_obj_delete" on storage.objects;
create policy "receipts_obj_read" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and public.can_see_claim(split_part(name, '/', 2)));
create policy "receipts_obj_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and public.can_see_claim(split_part(name, '/', 2)));
create policy "receipts_obj_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'receipts' and public.can_see_claim(split_part(name, '/', 2)));

-- ============================================================
-- 2) USERS — prevent self role-escalation (profile page may update own row)
-- ============================================================
create or replace function public.guard_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- only HR may change a role; for anyone else, keep the existing role
  if new.role is distinct from old.role and coalesce(public.my_role(), 'employee') <> 'hr_admin' then
    new.role := old.role;
  end if;
  return new;
end $$;
drop trigger if exists users_guard_role on public.users;
create trigger users_guard_role before update on public.users
  for each row execute function public.guard_user_role();

-- ============================================================
-- 3) ELIGIBILITY LIMITS per grade (Daily Allowance / Lodging caps)
-- ============================================================
create table if not exists public.grade_limits (
  grade        text primary key,
  max_da       numeric(12,2),
  max_lodging  numeric(12,2)
);
alter table public.grade_limits enable row level security;
drop policy if exists gl_read  on public.grade_limits;
drop policy if exists gl_write on public.grade_limits;
create policy gl_read  on public.grade_limits for select to authenticated using (true);
create policy gl_write on public.grade_limits for all
  using (public.my_role() = 'hr_admin') with check (public.my_role() = 'hr_admin');

insert into public.grade_limits (grade, max_da, max_lodging) values
  ('E1', 800, 1500), ('E2', 1000, 2500), ('M1', 1500, 3500), ('M2', 2000, 5000)
on conflict (grade) do nothing;

-- ============================================================
-- 4) NOTIFICATIONS — in-app alerts + fan-out trigger on status change
-- ============================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  claim_id   text references public.claims(id) on delete cascade,
  kind       text,                       -- review | approved | rejected | returned | paid
  message    text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notif_user on public.notifications(user_id, read);
alter table public.notifications enable row level security;
drop policy if exists nf_read   on public.notifications;
drop policy if exists nf_update on public.notifications;
create policy nf_read   on public.notifications for select using (user_id = auth.uid());
create policy nf_update on public.notifications for update using (user_id = auth.uid());

-- fan-out: when a claim's status changes, notify the right people (SECURITY DEFINER).
create or replace function public.notify_on_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'UPDATE' and new.status is not distinct from old.status) then return new; end if;
  if new.status = 'submitted' then
    insert into public.notifications(user_id, claim_id, kind, message)
      select id, new.id, 'review', 'New claim to review: ' || coalesce(new.purpose,'') || ' (' || new.id || ')'
      from public.users where role in ('hod','hr_admin');
  elsif new.status = 'hod_approved' then
    insert into public.notifications(user_id, claim_id, kind, message)
      select id, new.id, 'review', 'Claim ready to check: ' || new.id from public.users where role in ('checker','hr_admin');
  elsif new.status = 'checked' then
    insert into public.notifications(user_id, claim_id, kind, message)
      select id, new.id, 'review', 'Claim awaiting approval: ' || new.id from public.users where role in ('approver','hr_admin');
  elsif new.status = 'approved' then
    insert into public.notifications(user_id, claim_id, kind, message) values (new.user_id, new.id, 'approved', 'Your claim ' || new.id || ' was approved');
  elsif new.status = 'rejected' then
    insert into public.notifications(user_id, claim_id, kind, message) values (new.user_id, new.id, 'rejected', 'Your claim ' || new.id || ' was rejected');
  elsif new.status = 'returned' then
    insert into public.notifications(user_id, claim_id, kind, message) values (new.user_id, new.id, 'returned', 'Your claim ' || new.id || ' was returned for edit');
  elsif new.status = 'paid' then
    insert into public.notifications(user_id, claim_id, kind, message) values (new.user_id, new.id, 'paid', 'Your claim ' || new.id || ' was marked paid');
  end if;
  return new;
end $$;
drop trigger if exists claims_notify on public.claims;
create trigger claims_notify after insert or update on public.claims
  for each row execute function public.notify_on_status();

-- ============================================================
-- 5) 3-DAY REMINDER (optional; requires pg_cron). Notifies owners of trips that ended
--    3+ days ago whose claim is still a draft (or not yet submitted).
-- ============================================================
create or replace function public.remind_late_submissions()
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications(user_id, claim_id, kind, message)
    select c.user_id, c.id, 'reminder', 'Reminder: submit your travel report ' || c.id || ' (trip ended ' || c.trip_to || ')'
    from public.claims c
    where c.status = 'draft' and c.trip_to is not null and c.trip_to <= (current_date - interval '3 days')
      and not exists (select 1 from public.notifications n where n.claim_id = c.id and n.kind = 'reminder'
                      and n.created_at > now() - interval '7 days');
end $$;
-- To schedule daily (needs the pg_cron extension enabled in the dashboard):
--   select cron.schedule('triptrail-3day', '0 9 * * *', $$ select public.remind_late_submissions(); $$);
