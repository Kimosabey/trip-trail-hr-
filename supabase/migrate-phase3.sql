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
