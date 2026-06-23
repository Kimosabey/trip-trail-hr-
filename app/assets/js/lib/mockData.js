/* TripTrail — sample data so the whole app runs with NO backend (USE_MOCK = true).
   Mirrors the real RANGSONS sheet. Replaced by Supabase queries when USE_MOCK = false.
   In mock mode the data layer (api.js) persists claims to localStorage so you can submit as
   one user, switch to HR, and see the claim — testing "others add → HR sees" without login. */
window.TT = window.TT || {};

TT.mock = {
  // Demo users you can switch between in mock mode (the switcher lives in the top nav).
  users: [
    { id: 'u-ragha', full_name: 'Raghavendra D', designation: 'HR',              emp_code: 'EMP001', department: 'HR',          place_of_work: 'Mysuru',    role: 'hr_admin', grade: 'M2' },
    { id: 'u-amit',  full_name: 'Amit Sharma',   designation: 'Sales Executive', emp_code: 'EMP010', department: 'Sales',       place_of_work: 'Bengaluru', role: 'employee', grade: 'E1' },
    { id: 'u-hod',   full_name: 'Devi Rao',      designation: 'Head of Sales',   emp_code: 'EMP100', department: 'Sales',       place_of_work: 'Bengaluru', role: 'hod',      grade: 'M1' },
    { id: 'u-chk',   full_name: 'Suresh K',      designation: 'Finance Checker', emp_code: 'EMP101', department: 'Finance',     place_of_work: 'Mysuru',    role: 'checker',  grade: 'M1' },
    { id: 'u-priya', full_name: 'Priya Desai',   designation: 'Approver',        emp_code: 'EMP011', department: 'Management',  place_of_work: 'Mysuru',    role: 'approver', grade: 'M1' },
    { id: 'u-rahul', full_name: 'Rahul Singh',   designation: 'Engineer',        emp_code: 'EMP012', department: 'Engineering', place_of_work: 'Pune',      role: 'employee', grade: 'E2' },
  ],

  // Statuses: draft | submitted | hod_approved | checked | approved | paid | rejected
  seedClaims: [
    {
      id: 'TR-2026-03-882', user_id: 'u-ragha', employee_name: 'Raghavendra D', department: 'HR',
      purpose: 'Visit to CLIENT', place_of_visit: 'Whitefield',
      trip_from: '2026-03-04', trip_to: '2026-03-05',
      advance_received: 0, status: 'submitted', submitted_at: '2026-03-06T10:42:00',
      line_items: [
        { id: 'li1', item_date: '2026-03-04', journey_particulars: 'Mysore to Bengaluru', mode_of_transport: 'Bus', fare: 430, daily_allowance: 800, lodging: 1214, local_conveyance: 405, misc_details: '', misc_amount: 0 },
        { id: 'li2', item_date: '2026-03-05', journey_particulars: 'Bengaluru to Mysore', mode_of_transport: 'Bus', fare: 401, daily_allowance: 800, lodging: 0, local_conveyance: 0, misc_details: '', misc_amount: 0 },
        { id: 'li3', item_date: '2026-02-20', journey_particulars: 'Mysore to Bengaluru', mode_of_transport: 'Cab', fare: 0, daily_allowance: 800, lodging: 0, local_conveyance: 0, misc_details: 'Driver breakfast', misc_amount: 427 },
      ],
      conveyance: [
        { id: 'c1', item_date: '2026-03-04', from_place: 'Kuvempunagar', to_place: 'KSRTC Bus stand', mode: 'Auto', amount: 120, has_bill: false, remarks: '' },
        { id: 'c2', item_date: '2026-03-04', from_place: 'Kengeri Metro', to_place: 'Majestic', mode: 'Metro', amount: 60, has_bill: false, remarks: '' },
        { id: 'c3', item_date: '2026-03-04', from_place: 'Majestic', to_place: 'Mindful TMS Hebbal', mode: 'Cab', amount: 225, has_bill: true, remarks: '' },
      ],
      receipts: [{ id: 'r1', name: 'receipt_01.jpg', file_type: 'image' }, { id: 'r2', name: 'bus_ticket.pdf', file_type: 'pdf' }],
      approvals: [{ stage: 'submitted', actor: 'Raghavendra D', acted_at: '2026-03-06T10:42:00' }],
    },
    { id: 'TR-2026-02-771', user_id: 'u-ragha', employee_name: 'Raghavendra D', department: 'HR', purpose: 'Monthly Sync', place_of_visit: 'Bengaluru', trip_from: '2026-02-20', trip_to: '2026-02-21', advance_received: 0, status: 'paid', line_items: [], conveyance: [], receipts: [], approvals: [] },
    { id: 'TR-2026-02-654', user_id: 'u-ragha', employee_name: 'Raghavendra D', department: 'HR', purpose: 'Vendor Audit', place_of_visit: 'Mysuru', trip_from: '2026-02-10', trip_to: '2026-02-11', advance_received: 0, status: 'approved', line_items: [], conveyance: [], receipts: [], approvals: [] },
    { id: 'TR-2026-02-510', user_id: 'u-ragha', employee_name: 'Raghavendra D', department: 'HR', purpose: 'Strategy Meet', place_of_visit: 'Mangaluru', trip_from: '2026-02-01', trip_to: '2026-02-03', advance_received: 0, status: 'rejected', line_items: [], conveyance: [], receipts: [], approvals: [] },
    { id: 'TR-2026-01-409', user_id: 'u-ragha', employee_name: 'Raghavendra D', department: 'HR', purpose: 'Client Demo', place_of_visit: 'Whitefield', trip_from: '2026-01-25', trip_to: '2026-01-26', advance_received: 0, status: 'paid', line_items: [], conveyance: [], receipts: [], approvals: [] },
    // other employees so HR clearly sees more than their own
    { id: 'TR-2026-03-901', user_id: 'u-amit',  employee_name: 'Amit Sharma', department: 'Sales',       purpose: 'Client Meeting', place_of_visit: 'Mumbai', trip_from: '2026-03-10', trip_to: '2026-03-12', advance_received: 5000, status: 'submitted',    line_items: [], conveyance: [], receipts: [], approvals: [] },
    { id: 'TR-2026-03-903', user_id: 'u-rahul', employee_name: 'Rahul Singh', department: 'Engineering', purpose: 'Site Visit',     place_of_visit: 'Pune',   trip_from: '2026-03-05', trip_to: '2026-03-06', advance_received: 0,    status: 'checked',      line_items: [], conveyance: [], receipts: [], approvals: [] },
    { id: 'TR-2026-03-905', user_id: 'u-amit',  employee_name: 'Amit Sharma', department: 'Sales',       purpose: 'Demo Expo',      place_of_visit: 'Chennai', trip_from: '2026-03-15', trip_to: '2026-03-16', advance_received: 0,    status: 'hod_approved', line_items: [], conveyance: [], receipts: [], approvals: [] },
  ],
};

/* Cache computed totals onto each seed claim for list views. */
TT.mock.seedClaims.forEach(c => {
  c.grand_total = c.line_items && c.line_items.length
    ? TT.calc.grandTotal(c.line_items)
    : ({ 'TR-2026-02-771': 3210, 'TR-2026-02-654': 1850, 'TR-2026-02-510': 5920, 'TR-2026-01-409': 4100,
         'TR-2026-03-901': 15400, 'TR-2026-03-903': 8500, 'TR-2026-03-905': 4200 }[c.id] || 0);
  c.balance_due = TT.calc.balanceDue(c.grand_total, c.advance_received);
});
