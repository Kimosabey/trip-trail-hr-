-- TripTrail — fixes BOTH recursion bugs. Run this ONCE in the SQL Editor, then re-run seed.sql.
--
--  (1) Trigger recursion: the totals trigger updated line_items, re-firing itself.
--      -> guard with pg_trigger_depth().
--  (2) RLS recursion (the app's 500 on /claims): the security helpers read public.users,
--      but the users RLS policy calls those same helpers -> infinite loop.
--      -> make the helpers SECURITY DEFINER so their internal reads bypass RLS.

-- (1) trigger guard
create or replace function public.trg_recompute()
returns trigger language plpgsql as $$
begin
  if pg_trigger_depth() > 1 then
    return null;
  end if;
  perform public.recompute_claim_totals(coalesce(new.claim_id, old.claim_id));
  return null;
end $$;

-- (2) RLS helpers as SECURITY DEFINER (bypass RLS on their internal reads → no recursion)
create or replace function public.my_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role() in ('hr_admin','hod','checker','approver'), false)
$$;

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
