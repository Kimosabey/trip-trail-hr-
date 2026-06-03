-- TripTrail — fix for "stack depth limit exceeded" on inserting line_items/conveyance.
-- The totals trigger updates line_items, which re-fired itself recursively.
-- This adds a recursion guard. Run this ONCE in the SQL Editor, then re-run seed.sql.

create or replace function public.trg_recompute()
returns trigger language plpgsql as $$
begin
  if pg_trigger_depth() > 1 then
    return null;   -- skip the nested re-fire caused by recompute updating line_items
  end if;
  perform public.recompute_claim_totals(coalesce(new.claim_id, old.claim_id));
  return null;
end $$;
