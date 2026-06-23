-- TripTrail — set up test logins for ALL roles (live mode), using real company emails.
--
-- STEP 1 (dashboard, no email needed): Authentication → Users → Add user → Create new user,
--   tick "Auto Confirm User", password 123456, for:
--     kaushik@lingotran.com          (HOD)
--     dhanyashree.hp@lingotran.com   (Checker)
--     raghav.s@lingotran.com         (Approver)
--     deepaksomayya@gmail.com        (Employee #2)
--   (raghavendra.d@lingotran.com = HR and harshan.aiyappa@gmail.com = employee already exist)
--
-- STEP 2: run this in the SQL Editor to assign roles + profiles.

update public.users set role='hod',      full_name='Kaushik',        designation='Head of Dept',    department='Sales',      emp_code='EMP100', grade='M1', place_of_work='Bengaluru' where email='kaushik@lingotran.com';
update public.users set role='checker',  full_name='Dhanyashree HP', designation='Finance Checker', department='Finance',    emp_code='EMP101', grade='M1', place_of_work='Mysuru'    where email='dhanyashree.hp@lingotran.com';
update public.users set role='approver', full_name='Raghav S',       designation='Approver',        department='Management', emp_code='EMP102', grade='M2', place_of_work='Mysuru'    where email='raghav.s@lingotran.com';

-- existing accounts (idempotent)
update public.users set role='hr_admin', full_name='Raghavendra D',  designation='HR',              department='HR',    emp_code='EMP001', grade='M2', place_of_work='Mysuru'    where email='raghavendra.d@lingotran.com';
update public.users set role='employee', full_name='Harshan Aiyappa', designation='Sales Executive', department='Sales',       emp_code='EMP010', grade='E1', place_of_work='Bengaluru' where email='harshan.aiyappa@gmail.com';
update public.users set role='employee', full_name='Deepak Somayya',  designation='Engineer',        department='Engineering', emp_code='EMP011', grade='E2', place_of_work='Mysuru'    where email='deepaksomayya@gmail.com';

-- confirm
select email, full_name, role, department from public.users order by
  case role when 'hr_admin' then 0 when 'approver' then 1 when 'checker' then 2 when 'hod' then 3 else 4 end, email;

-- Full distinct-person chain now possible:
--   Submit (harshan) → HOD (kaushik) → Checked (dhanyashree) → Approved (raghav.s) → Paid (Raghavendra/HR)
-- Data to act on after seed.sql:
--   HOD → SEED-003 (submitted) · Checker → SEED-005 (hod_approved) · Approver → SEED-004 (checked)
--   HR  → all claims; mark SEED-002 / SEED-007 (approved) as Paid
