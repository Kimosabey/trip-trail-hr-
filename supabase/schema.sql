-- TripTrail — database schema (PostgreSQL / Supabase)
-- Run this first (SQL Editor → paste → Run), then policies.sql, then optionally seed.sql.
-- Covers every field from the RANGSONS Travel & Local Conveyance workbook (see plans/11-field-coverage.md).

-- ---------- enums ----------
do $$ begin
  create type claim_status as enum
    ('draft','submitted','hod_approved','checked','approved','paid','rejected','returned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('employee','hod','checker','approver','hr_admin');
exception when duplicate_object then null; end $$;

-- ---------- users (profile, linked to Supabase auth) ----------
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text unique,
  full_name     text not null,
  designation   text,
  emp_code      text,
  department    text,
  place_of_work text,
  role          user_role not null default 'employee',
  grade         text,                      -- for eligibility limits (Phase 3)
  created_at    timestamptz not null default now()
);

-- ---------- claims (Travel Report header + footer) ----------
create table if not exists public.claims (
  id               text primary key,        -- human ref e.g. TR-2026-03-882 (generated in app or trigger)
  user_id          uuid not null references public.users(id) on delete cascade,
  purpose          text,
  place_of_visit   text,
  trip_from        date,
  trip_to          date,
  advance_received numeric(12,2) not null default 0,
  grand_total      numeric(12,2) not null default 0,   -- maintained by trigger
  balance_due      numeric(12,2) not null default 0,   -- grand_total - advance_received
  status           claim_status not null default 'draft',
  voucher_ref      text,                      -- Cash Section voucher reference
  paid_at          timestamptz,
  submitted_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_claims_user on public.claims(user_id);
create index if not exists idx_claims_status on public.claims(status);

-- ---------- line_items (Travel Report rows) ----------
create table if not exists public.line_items (
  id                  uuid primary key default gen_random_uuid(),
  claim_id            text not null references public.claims(id) on delete cascade,
  item_date           date,
  journey_particulars text,
  mode_of_transport   text,
  fare                numeric(12,2) default 0,
  daily_allowance     numeric(12,2) default 0,
  lodging             numeric(12,2) default 0,
  local_conveyance    numeric(12,2) default 0,   -- = sum of this claim's conveyance rows
  misc_details        text,
  misc_amount         numeric(12,2) default 0,
  row_total           numeric(12,2) default 0,   -- maintained by trigger
  sort_order          int default 0
);
create index if not exists idx_li_claim on public.line_items(claim_id);

-- ---------- conveyance (Local Conveyance sub-form) ----------
create table if not exists public.conveyance (
  id          uuid primary key default gen_random_uuid(),
  claim_id    text not null references public.claims(id) on delete cascade,  -- cross-reference to Travel Report
  item_date   date,
  from_place  text,
  to_place    text,
  mode        text,
  amount      numeric(12,2) default 0,
  has_bill    boolean default false,     -- "Bill attached" vs "No Bill"
  remarks     text,
  sort_order  int default 0
);
create index if not exists idx_cv_claim on public.conveyance(claim_id);

-- ---------- receipts (uploaded bills in Supabase Storage) ----------
create table if not exists public.receipts (
  id            uuid primary key default gen_random_uuid(),
  claim_id      text not null references public.claims(id) on delete cascade,
  line_item_id  uuid references public.line_items(id) on delete set null,
  name          text,
  storage_path  text,                     -- path in the 'receipts' storage bucket
  file_type     text,                     -- image | pdf
  uploaded_at   timestamptz not null default now()
);

-- ---------- approvals (audit trail = the signature chain) ----------
create table if not exists public.approvals (
  id        uuid primary key default gen_random_uuid(),
  claim_id  text not null references public.claims(id) on delete cascade,
  actor_id  uuid references public.users(id),
  actor     text,                          -- denormalised name for display
  stage     text,                          -- submitted | hod | checker | approver | cashier
  action    text,                          -- approved | rejected | returned | submitted | paid
  comment   text,
  acted_at  timestamptz not null default now()
);
create index if not exists idx_ap_claim on public.approvals(claim_id);

-- ---------- totals engine (mirrors the spreadsheet formulas) ----------
create or replace function public.recompute_claim_totals(p_claim text)
returns void language plpgsql as $$
declare conv numeric(12,2);
begin
  select coalesce(sum(amount),0) into conv from public.conveyance where claim_id = p_claim;

  -- push conveyance total onto the first line item (matches the single Local Conveyance column)
  update public.line_items li set local_conveyance =
    case when li.id = (select id from public.line_items where claim_id = p_claim order by sort_order, id limit 1)
         then conv else 0 end
  where li.claim_id = p_claim;

  -- row totals
  update public.line_items
     set row_total = coalesce(fare,0)+coalesce(daily_allowance,0)+coalesce(lodging,0)+coalesce(local_conveyance,0)+coalesce(misc_amount,0)
   where claim_id = p_claim;

  -- grand total + balance
  update public.claims c
     set grand_total = coalesce((select sum(row_total) from public.line_items where claim_id = p_claim),0),
         balance_due = coalesce((select sum(row_total) from public.line_items where claim_id = p_claim),0) - coalesce(c.advance_received,0),
         updated_at  = now()
   where c.id = p_claim;
end $$;

create or replace function public.trg_recompute()
returns trigger language plpgsql as $$
begin
  -- recompute_claim_totals updates line_items, which re-fires this trigger.
  -- Only run at the top level to avoid infinite recursion.
  if pg_trigger_depth() > 1 then
    return null;
  end if;
  perform public.recompute_claim_totals(coalesce(new.claim_id, old.claim_id));
  return null;
end $$;

drop trigger if exists t_li_recompute on public.line_items;
create trigger t_li_recompute after insert or update or delete on public.line_items
  for each row execute function public.trg_recompute();

drop trigger if exists t_cv_recompute on public.conveyance;
create trigger t_cv_recompute after insert or update or delete on public.conveyance
  for each row execute function public.trg_recompute();

-- auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
