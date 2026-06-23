-- TripTrail — FIX: employees couldn't submit their own claims (draft/returned → submitted).
-- The claims_update policy had only USING (reused as WITH CHECK), blocking the status change.
-- Run this once in the SQL Editor. (Also included in migrate-phase3.sql section 6.)

drop policy if exists claims_update on public.claims;
create policy claims_update on public.claims
  for update
  using (
    (user_id = auth.uid() and status in ('draft','returned'))
    or public.is_staff()
  )
  with check (
    (user_id = auth.uid() and status in ('draft','returned','submitted'))
    or public.is_staff()
  );
