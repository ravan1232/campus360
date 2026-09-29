export const roles = {
  ADMIN: { label: 'Administrator', short: 'Admin' },
  TEACHER: { label: 'Teacher', short: 'Teacher' },
  STUDENT: { label: 'Student', short: 'Student' },
  ACCOUNTANT: { label: 'Accountant', short: 'Accountant' },
  DRIVER: { label: 'Driver', short: 'Driver' },
  GATE_GUARD: { label: 'Gate Security', short: 'Gate' }
};

export const dashboardData = {
  ADMIN: {
    title: 'School Operations Center',
    subtitle: 'Monitor student enrollment, academic progress, revenue and fleet in real-time.',
    stats: [
      ['Total students', '1,248', '+4.2% from last term', '🎓'],
      ['Faculty & staff', '86', '100% active roster', '📚'],
      ['Fee collection', '92.4%', '$1.48M Collected', '💰'],
      ['Active transport', '14 / 15', '1 in maintenance', '🚌']
    ]
  },
  TEACHER: {
    title: 'Classroom & Faculty Workspace',
    subtitle: 'Manage student attendance, today\'s lecture schedule, and academic evaluations.',
    stats: [
      ['Classes scheduled', '3 sessions', 'Next: Period 1 (08:30)', '📚'],
      ['Class attendance', '94.2%', '+1.5% this week', '📋'],
      ['Student roster', '38 students', 'Grade 10-A Physics', '🎓'],
      ['Assigned requests', '4 open', '2 leave, 2 inquiries', '📝']
    ]
  },
  STUDENT: {
    title: 'Student Academic Portal',
    subtitle: 'Track your enrolled course performance, daily attendance, fee ledger, and bus route.',
    stats: [
      ['Overall attendance', '94.5%', 'Above minimum required (85%)', '📋'],
      ['Cumulative GPA', '3.88 / 4.0', 'Dean\'s High Honors List', '⭐'],
      ['Tuition balance', '$0.00', 'Term 1 fees fully cleared', '💳'],
      ['Assigned transit', 'Route 12', 'Approaching Stop 3 (Westfield)', '🚌']
    ]
  },
  ACCOUNTANT: {
    title: 'Bursar & Finance Hub',
    subtitle: 'Manage tuition billing, fee collections, staff payroll, and budget requisitions.',
    stats: [
      ['Total invoiced', '$145,050', 'Academic Year 2026-27', '🧾'],
      ['Total collected', '$130,200', '90% collection ratio', '💰'],
      ['Outstanding dues', '$14,850', 'Requires collection reminder', '⚠️'],
      ['Payroll status', 'Approved', 'Disbursed for current month', '💼']
    ]
  },
  DRIVER: {
    title: 'Transit Driver Console',
    subtitle: 'View scheduled station stops, verify passenger boarding, and log vehicle maintenance.',
    stats: [
      ['Assigned bus', 'BUS-012', 'Volvo B7R Low-Floor Transit', '🚌'],
      ['Passengers onboard', '38 / 45', '84% seating capacity', '👥'],
      ['Fuel level', '78%', 'Sufficient for evening route', '⛽'],
      ['Safety condition', 'Good condition', 'Inspected yesterday morning', '✅']
    ]
  },
  GATE_GUARD: {
    title: 'Perimeter Security & Gate Station',
    subtitle: 'Issue digital visitor passes, log student outpasses, and track campus perimeter access.',
    stats: [
      ['Active visitors', '3 on campus', 'Within perimeter authorized', '🚪'],
      ['Total entries today', '342 logs', 'Vehicles and pedestrians', '🛡️'],
      ['Student outpasses', '14 issued', 'Verified by administrative office', '🕒'],
      ['Security status', 'Code Green', 'Zero perimeter incidents', '✅']
    ]
  }
};

export const activities = [
  {
    title: 'New student admission confirmed',
    meta: 'Aarav Sharma · Grade 10-A · ID: ST-1023',
    time: '5 min ago',
    type: 'academic'
  },
  {
    title: 'Tuition payment received online',
    meta: 'Ananya Rao · INV-5520 · $1,250.00',
    time: '18 min ago',
    type: 'finance'
  },
  {
    title: 'Visitor pass approved & checked in',
    meta: 'Dr. Claire Laurent · Host: Principal Dr. Jenkins',
    time: '34 min ago',
    type: 'gate'
  },
  {
    title: 'Bus Route 12 transit update',
    meta: 'KA-01-AB-1234 · Arrived at Campus Main Terminal',
    time: '1 hr ago',
    type: 'transport'
  },
  {
    title: 'Grade 10-A Attendance submitted',
    meta: 'Prof. Marcus Vance · 36/38 Present',
    time: '2 hrs ago',
    type: 'academic'
  },
  {
    title: 'Vehicle maintenance checklist completed',
    meta: 'Bus-008 Hydraulic safety inspection passed',
    time: '3 hrs ago',
    type: 'transport'
  }
];
