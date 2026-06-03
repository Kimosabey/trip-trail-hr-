-- TripTrail — Row-Level Security. Run AFTER schema.sql.
-- CORE OBJECTIVE enforced here: HR (hr_admin) can see & track EVERY employee's claims;
-- employees can only see/edit their OWN. Approvers can read all + act at their stage.

alter table public.users      enable row level security;
alter table public.claims     enable row level security;
alter table public.line_items enable row level security;
alter table public.conveyance enable row level security;
alter table public.receipts   enable row level security;
alter table public.approvals  enable row level security;

-- helper: is the current user HR/approver staff?
-- SECURITY DEFINER so their internal read of public.users bypasses RLS — otherwise the
-- users policy (which calls these) would recurse infinitely on every query.
create or replace function public.my_role() returns user_role
language sql stable security definer set search_path = public
as $$ select role from public.users where id = auth.uid() $$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role() in ('hr_admin','hod','checker','approver'), false)
$$;

-- ---------- users ----------
create policy users_self_read on public.users
  for select using (id = auth.uid() or public.is_staff());
create policy users_self_update on public.users
  for update using (id = auth.uid());
create policy users_hr_manage on public.users
  for all using (public.my_role() = 'hr_admin') with check (public.my_role() = 'hr_admin');

-- ---------- claims ----------
-- read: owner OR any staff (HR sees all — the whole point)
create policy claims_read on public.claims
  for select using (user_id = auth.uid() or public.is_staff());
-- insert: only as yourself
create policy claims_insert on public.claims
  for insert with check (user_id = auth.uid());
-- update: owner may edit while draft/returned; staff may update (status transitions)
create policy claims_update on public.claims
  for update using (
    (user_id = auth.uid() and status in ('draft','returned'))
    or public.is_staff()
  );
-- delete: owner draft only
create policy claims_delete on public.claims
  for delete using (user_id = auth.uid() and status = 'draft');

-- ---------- child tables: gated through the parent claim ----------
create or replace function public.can_see_claim(p_claim text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.claims c
    where c.id = p_claim and (c.user_id = auth.uid() or public.is_staff())
  )
$$;
create or replace function public.can_edit_claim(p_claim text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.claims c
    where c.id = p_claim and c.user_id = auth.uid() and c.status in ('draft','returned')
  )
$$;

-- line_items
create policy li_read on public.line_items for select using (public.can_see_claim(claim_id));
create policy li_write on public.line_items for all
  using (public.can_edit_claim(claim_id)) with check (public.can_edit_claim(claim_id));

-- conveyance
create policy cv_read on public.conveyance for select using (public.can_see_claim(claim_id));
create policy cv_write on public.conveyance for all
  using (public.can_edit_claim(claim_id)) with check (public.can_edit_claim(claim_id));

-- receipts
create policy rc_read on public.receipts for select using (public.can_see_claim(claim_id));
create policy rc_write on public.receipts for all
  using (public.can_edit_claim(claim_id)) with check (public.can_edit_claim(claim_id));

-- approvals: anyone who can see the claim can read the trail; staff can add entries
create policy ap_read on public.approvals for select using (public.can_see_claim(claim_id));
create policy ap_insert on public.approvals for insert with check (public.is_staff() or public.can_edit_claim(claim_id));
