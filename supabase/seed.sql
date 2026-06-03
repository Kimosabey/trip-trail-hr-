-- TripTrail — demo seed data. Run in Supabase SQL Editor AFTER schema.sql + policies.sql.
-- Safe to re-run: it deletes its own SEED-* rows first. Totals are computed by triggers.
-- Attributes claims to your two existing accounts (looked up by email), so the HR Dashboard,
-- pipeline and Reports look populated.

-- clean previous seed (cascade removes child rows)
delete from public.claims where id like 'SEED-%';

do $$
declare emp uuid; hr uuid;
begin
  select id into emp from public.users where email = 'harshan.aiyappa@gmail.com';
  select id into hr  from public.users where email = 'raghavendra.d@lingotran.com';
  if emp is null or hr is null then
    raise exception 'Seed needs both users to exist (harshan.aiyappa@gmail.com, raghavendra.d@lingotran.com). Sign them in / add them first.';
  end if;

  -- ---- claims (mix of statuses, people, months) ----
  insert into public.claims (id, user_id, purpose, place_of_visit, trip_from, trip_to, advance_received, status, submitted_at) values
    ('SEED-001', emp, 'Client Meeting',        'Mumbai',     '2026-01-12','2026-01-13', 0,    'paid',         '2026-01-15'),
    ('SEED-002', emp, 'Vendor Negotiation',    'Chennai',    '2026-02-03','2026-02-04', 2000, 'approved',     '2026-02-06'),
    ('SEED-003', emp, 'Site Visit',            'Pune',       '2026-02-18','2026-02-19', 0,    'submitted',    '2026-02-20'),
    ('SEED-004', emp, 'Conference',            'Delhi',      '2026-03-05','2026-03-07', 5000, 'checked',      '2026-03-08'),
    ('SEED-005', emp, 'Client Demo',           'Whitefield', '2026-03-11','2026-03-11', 0,    'hod_approved', '2026-03-12'),
    ('SEED-006', emp, 'Trade Expo',            'Hyderabad',  '2026-01-22','2026-01-24', 0,    'rejected',     '2026-01-25'),
    ('SEED-007', hr,  'Recruitment Drive',     'Bengaluru',  '2026-03-04','2026-03-05', 0,    'approved',     '2026-03-06'),
    ('SEED-008', hr,  'Policy Workshop',       'Mysuru',     '2026-02-10','2026-02-11', 0,    'paid',         '2026-02-12');

  update public.claims set voucher_ref = 'V-1001', paid_at = '2026-01-18' where id = 'SEED-001';
  update public.claims set voucher_ref = 'V-1002', paid_at = '2026-02-15' where id = 'SEED-008';

  -- ---- line items (trigger computes row_total + grand_total) ----
  insert into public.line_items (claim_id, item_date, journey_particulars, mode_of_transport, fare, daily_allowance, lodging, misc_details, misc_amount, sort_order) values
    ('SEED-001','2026-01-12','Mysuru to Mumbai','Flight',4800,800,3200,'Airport parking',300,0),
    ('SEED-001','2026-01-13','Mumbai to Mysuru','Flight',4600,800,0,'',0,1),
    ('SEED-002','2026-02-03','Mysuru to Chennai','Train',1200,800,1800,'',0,0),
    ('SEED-003','2026-02-18','Bengaluru to Pune','Flight',3500,800,2200,'Client lunch',650,0),
    ('SEED-004','2026-03-05','Mysuru to Delhi','Flight',6200,800,4500,'',0,0),
    ('SEED-004','2026-03-07','Delhi to Mysuru','Flight',6100,800,0,'',0,1),
    ('SEED-005','2026-03-11','Mysuru to Whitefield','Cab',1400,800,0,'',0,0),
    ('SEED-006','2026-01-22','Mysuru to Hyderabad','Train',1100,800,2400,'Booth charges',1500,0),
    ('SEED-007','2026-03-04','Mysuru to Bengaluru','Bus',430,800,1214,'',0,0),
    ('SEED-007','2026-03-05','Bengaluru to Mysuru','Bus',401,800,0,'',0,1),
    ('SEED-008','2026-02-10','Local','Auto',0,800,0,'Stationery',250,0);

  -- ---- local conveyance (trigger pushes total onto the first line item) ----
  insert into public.conveyance (claim_id, item_date, from_place, to_place, mode, amount, has_bill, sort_order) values
    ('SEED-001','2026-01-12','Airport','Hotel','Cab',600,true,0),
    ('SEED-001','2026-01-13','Hotel','Client office','Cab',350,false,1),
    ('SEED-004','2026-03-05','Airport','Venue','Cab',500,true,0),
    ('SEED-007','2026-03-04','Kuvempunagar','KSRTC Bus stand','Auto',120,false,0),
    ('SEED-007','2026-03-04','Majestic','Hebbal','Cab',225,true,1);
end $$;

-- verify
select id, status, grand_total, advance_received, balance_due from public.claims where id like 'SEED-%' order by id;
