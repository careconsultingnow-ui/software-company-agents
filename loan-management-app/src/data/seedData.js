/**
 * LendTrack - Pre-seeded Production Demo Data
 * Contains realistic Private Lending Agency data in Belize (BZD currency)
 * 15 borrowers with realistic loans (Current, Early Arrears, Delinquent, Paid Off)
 */

import { generateSchedule, INTEREST_METHODS } from '../core/calculator.js';
import { recalculateLoanState } from '../core/ledger.js';

export const INITIAL_ORGANIZATION = {
  id: 'org_bz_01',
  name: 'Belize QuickLend Financial Services',
  tagline: 'Fast, Transparent Micro-Lending & Collateral Loans',
  currency: 'BZD ($)',
  currency_symbol: '$',
  address: '14 Albert Street, Downtown Belize City',
  phone: '+501 223-4567',
  whatsapp: '+501 620-8000',
  email: 'collections@quicklend.bz',
  default_interest_method: INTEREST_METHODS.FLAT,
  default_rate: 20,
  grace_period_days: 3,
  late_fee_type: 'fixed',
  late_fee_amount: 25.00
};

export const INITIAL_USERS = [
  { id: 'usr_1', name: 'Patrick (Admin/Owner)', role: 'owner', email: 'patrick@quicklend.bz' },
  { id: 'usr_2', name: 'Sarah Miller', role: 'loan_officer', email: 'sarah@quicklend.bz' },
  { id: 'usr_3', name: 'Carlos Mendez', role: 'collector', email: 'carlos@quicklend.bz' },
  { id: 'usr_4', name: 'Auditor Belize', role: 'read_only', email: 'audit@quicklend.bz' }
];

export const INITIAL_BORROWERS = [
  {
    id: 'bor_01',
    name: 'Elena Martinez',
    id_number: 'BZ-748921-C',
    phone: '+501 622-1144',
    email: 'elena.m@sanignacio.bz',
    address: 'Burns Avenue, San Ignacio, Cayo',
    employer: 'Self-Employed (San Ignacio Produce Market Stall #14)',
    guarantor: 'Mateo Martinez (Brother, +501 623-8899)',
    notes: 'Long-standing market vendor. Excellent weekly payer.',
    status: 'active',
    rating: 'excellent'
  },
  {
    id: 'bor_02',
    name: 'Marcus Flowers',
    id_number: 'BZ-381902-B',
    phone: '+501 610-8833',
    email: 'marcus.flowers@bdf.gov.bz',
    address: 'Mile 8 George Price Hwy, Belize City',
    employer: 'Belize Defence Force (Civilian Personnel)',
    guarantor: 'Sergeant L. Thompson (+501 611-3322)',
    notes: 'Payday advance loan tied to 15th and 30th govt salary deductions.',
    status: 'active',
    rating: 'good'
  },
  {
    id: 'bor_03',
    name: 'Darrell Young',
    id_number: 'BZ-992314-P',
    phone: '+501 629-4455',
    email: 'darrell.taxi@gmail.com',
    address: 'Constitution Drive, Belmopan',
    employer: 'Independent Taxi & Courier Operator',
    guarantor: 'Brenda Young (Wife, +501 630-1122)',
    notes: 'Vehicle transmission repair loan. Missed last bi-weekly payment due to maintenance delay.',
    status: 'overdue',
    rating: 'risky'
  },
  {
    id: 'bor_04',
    name: 'Vanessa Castillo',
    id_number: 'BZ-405118-O',
    phone: '+501 631-7722',
    email: 'vcastillo.grocery@gmail.com',
    address: 'Baker\'s Street, Orange Walk Town',
    employer: 'Owner, Sugar City Grocery & Dry Goods',
    guarantor: 'Hernan Castillo (+501 632-4411)',
    notes: 'Wholesale inventory restocking loan. Currently 40+ days in arrears. Responding on WhatsApp.',
    status: 'overdue',
    rating: 'critical'
  },
  {
    id: 'bor_05',
    name: 'Kevin Bradley',
    id_number: 'BZ-827361-S',
    phone: '+501 624-9900',
    email: 'kbradley.charters@placencia.com',
    address: 'Sidewalk Placencia Village, Stann Creek',
    employer: 'Placencia Reef & Sportfishing Tours',
    guarantor: 'Captain Ray Bradley (+501 625-1100)',
    notes: 'Outboard motor overhaul financing. Paid off in full ahead of schedule.',
    status: 'active',
    rating: 'excellent'
  },
  {
    id: 'bor_06',
    name: 'Lisbeth Novelo',
    id_number: 'BZ-193822-C',
    phone: '+501 615-3321',
    email: 'lnovelo@stfrancis.edu.bz',
    address: '4th Avenue, Corozal Town',
    employer: 'Ministry of Education (St. Francis Xavier Primary)',
    guarantor: 'Principal J. Campos (+501 616-2244)',
    notes: 'School tuition financing for daughter. Perfect on-time salary payer.',
    status: 'active',
    rating: 'good'
  },
  {
    id: 'bor_07',
    name: 'Carlos Pech',
    id_number: 'BZ-552910-A',
    phone: '+501 628-5544',
    email: 'carlos.pech.dive@sanpedro.com',
    address: 'Barrier Reef Drive, San Pedro, Ambergris Caye',
    employer: 'Blue Wave Dive Shop',
    guarantor: 'Maria Pech (+501 629-9911)',
    notes: 'Weekly equipment loan. Always pays cash at the branch.',
    status: 'active',
    rating: 'good'
  },
  {
    id: 'bor_08',
    name: 'Arlene Sutherland',
    id_number: 'BZ-601934-D',
    phone: '+501 602-9988',
    email: 'arlene.bakes@dangriga.bz',
    address: 'Commerce Street, Dangriga',
    employer: 'Owner, Sunrise Bakery & Creole Bread',
    guarantor: 'Anthony Sutherland (+501 603-4477)',
    notes: 'Commercial baking oven loan. Regular bi-weekly payer.',
    status: 'active',
    rating: 'good'
  },
  {
    id: 'bor_09',
    name: 'Dwight Tillett',
    id_number: 'BZ-719302-B',
    phone: '+501 614-7766',
    email: 'dwight.tillett@portloyola.bz',
    address: 'Fabers Road, Belize City',
    employer: 'Port Loyola Auto Works',
    guarantor: 'Keith Tillett (+501 615-8833)',
    notes: 'Tool acquisition loan. Just past due date by 5 days.',
    status: 'overdue',
    rating: 'attention'
  },
  {
    id: 'bor_10',
    name: 'Maria Guitterez',
    id_number: 'BZ-882019-T',
    phone: '+501 633-2211',
    email: 'maria.toledocrafts@gmail.com',
    address: 'Front Street, Punta Gorda, Toledo',
    employer: 'Toledo Cacao & Handicraft Emporium',
    guarantor: 'Eusebio Guitterez (+501 634-1188)',
    notes: 'Monthly loan for craft festival supplies.',
    status: 'active',
    rating: 'good'
  },
  {
    id: 'bor_11',
    name: 'Jamaal Banner',
    id_number: 'BZ-229481-B',
    phone: '+501 620-4499',
    email: 'jamaal.banner@gov.bz',
    address: 'Ring Road, Belmopan',
    employer: 'Central Information Technology Office (CITO)',
    guarantor: 'Sharon Banner (+501 621-7733)',
    notes: 'Personal loan for home computer equipment. Automatic salary direct deposit.',
    status: 'active',
    rating: 'excellent'
  },
  {
    id: 'bor_12',
    name: 'Cindy Hyde',
    id_number: 'BZ-339182-C',
    phone: '+501 612-8877',
    email: 'cindy.hyde@westernpharm.bz',
    address: 'Bullet Tree Road, San Ignacio, Cayo',
    employer: 'Western Pharmacy San Ignacio',
    guarantor: 'Rene Hyde (+501 613-2211)',
    notes: 'Short-term payday emergency loan. Paid off completely.',
    status: 'active',
    rating: 'excellent'
  },
  {
    id: 'bor_13',
    name: 'Ricardo Moguel',
    id_number: 'BZ-118492-O',
    phone: '+501 635-1199',
    email: 'rmoguel.haulage@gmail.com',
    address: 'Trial Farm Village, Orange Walk District',
    employer: 'Moguel Heavy Haulage & Cane Transport',
    guarantor: 'Nestor Moguel (+501 636-5544)',
    notes: 'Sugar cane tractor repairs. 70+ days delinquent. Legal notice prepared.',
    status: 'overdue',
    rating: 'critical'
  },
  {
    id: 'bor_14',
    name: 'Natasha Bennett',
    id_number: 'BZ-948102-K',
    phone: '+501 607-3344',
    email: 'nbennett.nurse@khmh.bz',
    address: 'Princess Margaret Drive, Belize City',
    employer: 'Karl Heusner Memorial Hospital (KHMH RN)',
    guarantor: 'Dr. Aaron Bennett (+501 608-9922)',
    notes: 'Bi-weekly medical advance loan. Dependable healthcare worker.',
    status: 'active',
    rating: 'excellent'
  },
  {
    id: 'bor_15',
    name: 'Trevor Leslie',
    id_number: 'BZ-502931-P',
    phone: '+501 626-6622',
    email: 'trevor.chef@hopkinsresort.bz',
    address: 'Hopkins Village, Stann Creek',
    employer: 'Hopkins Bay Resort (Executive Sous Chef)',
    guarantor: 'Darlene Leslie (+501 627-4488)',
    notes: 'Paid off 3-month loan early. High credit standing.',
    status: 'active',
    rating: 'excellent'
  }
];

// Helper to generate seed dataset with realistic loan states
export function generateSeedData() {
  const loans = [];
  const allInstallments = [];
  const allPayments = [];
  const allCharges = [];
  const allAuditLogs = [];

  // Loan 1: Elena Martinez - Active Microloan (Weekly, 12 weeks, Flat 15%)
  const l1Schedule = generateSchedule({
    principal: 1200,
    annualRate: 15,
    interestMethod: INTEREST_METHODS.FLAT,
    termCount: 12,
    frequency: 'WEEKLY',
    startDate: '2026-08-10',
    processingFee: 30
  });

  const loan1 = {
    id: 'ln_001',
    loan_number: 'LN-2026-001',
    borrower_id: 'bor_01',
    borrower_name: 'Elena Martinez',
    principal: 1200,
    rate: 15,
    interest_method: 'flat',
    term_count: 12,
    frequency: 'WEEKLY',
    start_date: '2026-08-10',
    fees: 30,
    status: 'active',
    created_by: 'Sarah Miller',
    notes: 'San Ignacio market produce inventory loan'
  };

  l1Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan1.id, id: `inst_${loan1.id}_${inst.installment_number}` });
  });

  // Loan 1 Payments (6 installments paid on time)
  for (let i = 1; i <= 6; i++) {
    const pDate = allInstallments.find(x => x.loan_id === loan1.id && x.installment_number === i).due_date;
    allPayments.push({
      id: `pay_${loan1.id}_0${i}`,
      loan_id: loan1.id,
      amount: l1Schedule.installmentAmount,
      date: pDate,
      method: 'cash',
      received_by: 'Sarah Miller',
      receipt_number: `RCP-BZ-100${i}`,
      notes: `Installment #${i} weekly market payment`,
      timestamp: `${pDate}T10:15:00Z`
    });
  }

  // Loan 2: Marcus Flowers - Active Payday Advance (Bi-weekly, 8 terms, Flat 18%)
  const l2Schedule = generateSchedule({
    principal: 3000,
    annualRate: 18,
    interestMethod: INTEREST_METHODS.FLAT,
    termCount: 8,
    frequency: 'BIWEEKLY',
    startDate: '2026-08-15',
    processingFee: 50
  });
  const loan2 = {
    id: 'ln_002',
    loan_number: 'LN-2026-002',
    borrower_id: 'bor_02',
    borrower_name: 'Marcus Flowers',
    principal: 3000,
    rate: 18,
    interest_method: 'flat',
    term_count: 8,
    frequency: 'BIWEEKLY',
    start_date: '2026-08-15',
    fees: 50,
    status: 'active',
    created_by: 'Sarah Miller',
    notes: 'Govt salary payday loan'
  };
  l2Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan2.id, id: `inst_${loan2.id}_${inst.installment_number}` });
  });
  for (let i = 1; i <= 3; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan2.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan2.id}_0${i}`,
      loan_id: loan2.id,
      amount: l2Schedule.installmentAmount,
      date: inst.due_date,
      method: 'bank_transfer',
      received_by: 'Patrick (Admin/Owner)',
      receipt_number: `RCP-BZ-200${i}`,
      notes: `Govt salary direct transfer installment #${i}`,
      timestamp: `${inst.due_date}T14:30:00Z`
    });
  }

  // Loan 3: Darrell Young - OVERDUE (12 days overdue)
  const l3Schedule = generateSchedule({
    principal: 2000,
    annualRate: 20,
    interestMethod: INTEREST_METHODS.FLAT,
    termCount: 6,
    frequency: 'BIWEEKLY',
    startDate: '2026-08-01',
    processingFee: 40
  });
  const loan3 = {
    id: 'ln_003',
    loan_number: 'LN-2026-003',
    borrower_id: 'bor_03',
    borrower_name: 'Darrell Young',
    principal: 2000,
    rate: 20,
    interest_method: 'flat',
    term_count: 6,
    frequency: 'BIWEEKLY',
    start_date: '2026-08-01',
    fees: 40,
    status: 'overdue',
    created_by: 'Carlos Mendez',
    notes: 'Taxi gearbox overhaul loan'
  };
  l3Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan3.id, id: `inst_${loan3.id}_${inst.installment_number}` });
  });
  // Paid 2 installments, missed 3rd and 4th
  for (let i = 1; i <= 2; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan3.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan3.id}_0${i}`,
      loan_id: loan3.id,
      amount: l3Schedule.installmentAmount,
      date: inst.due_date,
      method: 'cash',
      received_by: 'Carlos Mendez',
      receipt_number: `RCP-BZ-300${i}`,
      notes: `Taxi cash receipt #${i}`,
      timestamp: `${inst.due_date}T16:00:00Z`
    });
  }
  // Add a late charge
  allCharges.push({
    id: 'chg_001',
    loan_id: loan3.id,
    type: 'late_fee',
    amount: 25.00,
    waived: false,
    reason: 'Missed due date on installment #3 (>10 days past due)',
    created_at: '2026-09-20'
  });

  // Loan 4: Vanessa Castillo - SERIOUS OVERDUE (42 days late, PAR 30+)
  const l4Schedule = generateSchedule({
    principal: 4500,
    annualRate: 24,
    interestMethod: INTEREST_METHODS.REDUCING,
    termCount: 6,
    frequency: 'MONTHLY',
    startDate: '2026-06-15',
    processingFee: 75
  });
  const loan4 = {
    id: 'ln_004',
    loan_number: 'LN-2026-004',
    borrower_id: 'bor_04',
    borrower_name: 'Vanessa Castillo',
    principal: 4500,
    rate: 24,
    interest_method: 'reducing',
    term_count: 6,
    frequency: 'MONTHLY',
    start_date: '2026-06-15',
    fees: 75,
    status: 'overdue',
    created_by: 'Sarah Miller',
    notes: 'Orange Walk Grocery expansion'
  };
  l4Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan4.id, id: `inst_${loan4.id}_${inst.installment_number}` });
  });
  // Paid 1st installment, missed July & August
  const inst1 = allInstallments.find(x => x.loan_id === loan4.id && x.installment_number === 1);
  allPayments.push({
    id: `pay_${loan4.id}_01`,
    loan_id: loan4.id,
    amount: l4Schedule.installmentAmount,
    date: inst1.due_date,
    method: 'mobile_digiwallet',
    received_by: 'Sarah Miller',
    receipt_number: 'RCP-BZ-4001',
    notes: 'DigiWallet payment for 1st installment',
    timestamp: `${inst1.due_date}T11:20:00Z`
  });
  allCharges.push({
    id: 'chg_002',
    loan_id: loan4.id,
    type: 'late_fee',
    amount: 50.00,
    waived: false,
    reason: 'Arrears penalty for 2 missed monthly installments',
    created_at: '2026-08-25'
  });

  // Loan 5: Kevin Bradley - FULLY PAID OFF
  const l5Schedule = generateSchedule({
    principal: 1500,
    annualRate: 15,
    interestMethod: INTEREST_METHODS.FLAT,
    termCount: 4,
    frequency: 'MONTHLY',
    startDate: '2026-04-01',
    processingFee: 25
  });
  const loan5 = {
    id: 'ln_005',
    loan_number: 'LN-2026-005',
    borrower_id: 'bor_05',
    borrower_name: 'Kevin Bradley',
    principal: 1500,
    rate: 15,
    interest_method: 'flat',
    term_count: 4,
    frequency: 'MONTHLY',
    start_date: '2026-04-01',
    fees: 25,
    status: 'paid_off',
    created_by: 'Patrick (Admin/Owner)',
    notes: 'Outboard engine loan. Completely settled.'
  };
  l5Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan5.id, id: `inst_${loan5.id}_${inst.installment_number}` });
  });
  for (let i = 1; i <= 4; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan5.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan5.id}_0${i}`,
      loan_id: loan5.id,
      amount: l5Schedule.installmentAmount,
      date: inst.due_date,
      method: 'bank_transfer',
      received_by: 'Patrick (Admin/Owner)',
      receipt_number: `RCP-BZ-500${i}`,
      notes: `Installment #${i} paid in full`,
      timestamp: `${inst.due_date}T09:00:00Z`
    });
  }

  // Loan 6: Lisbeth Novelo - Active Monthly (10 months)
  const l6Schedule = generateSchedule({
    principal: 2500,
    annualRate: 18,
    interestMethod: INTEREST_METHODS.REDUCING,
    termCount: 10,
    frequency: 'MONTHLY',
    startDate: '2026-07-01',
    processingFee: 50
  });
  const loan6 = {
    id: 'ln_006',
    loan_number: 'LN-2026-006',
    borrower_id: 'bor_06',
    borrower_name: 'Lisbeth Novelo',
    principal: 2500,
    rate: 18,
    interest_method: 'reducing',
    term_count: 10,
    frequency: 'MONTHLY',
    start_date: '2026-07-01',
    fees: 50,
    status: 'active',
    created_by: 'Sarah Miller',
    notes: 'Tuition support loan'
  };
  l6Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan6.id, id: `inst_${loan6.id}_${inst.installment_number}` });
  });
  for (let i = 1; i <= 3; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan6.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan6.id}_0${i}`,
      loan_id: loan6.id,
      amount: l6Schedule.installmentAmount,
      date: inst.due_date,
      method: 'bank_transfer',
      received_by: 'Sarah Miller',
      receipt_number: `RCP-BZ-600${i}`,
      notes: `Teacher salary installment #${i}`,
      timestamp: `${inst.due_date}T15:00:00Z`
    });
  }

  // Loan 7: Carlos Pech - Active Weekly (Ambergris Caye)
  const l7Schedule = generateSchedule({
    principal: 800,
    annualRate: 12,
    interestMethod: INTEREST_METHODS.FLAT,
    termCount: 8,
    frequency: 'WEEKLY',
    startDate: '2026-09-01',
    processingFee: 20
  });
  const loan7 = {
    id: 'ln_007',
    loan_number: 'LN-2026-007',
    borrower_id: 'bor_07',
    borrower_name: 'Carlos Pech',
    principal: 800,
    rate: 12,
    interest_method: 'flat',
    term_count: 8,
    frequency: 'WEEKLY',
    start_date: '2026-09-01',
    fees: 20,
    status: 'active',
    created_by: 'Carlos Mendez',
    notes: 'Scuba gear emergency purchase'
  };
  l7Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan7.id, id: `inst_${loan7.id}_${inst.installment_number}` });
  });
  for (let i = 1; i <= 4; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan7.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan7.id}_0${i}`,
      loan_id: loan7.id,
      amount: l7Schedule.installmentAmount,
      date: inst.due_date,
      method: 'cash',
      received_by: 'Carlos Mendez',
      receipt_number: `RCP-BZ-700${i}`,
      notes: `Weekly tourist tip cash installment #${i}`,
      timestamp: `${inst.due_date}T17:15:00Z`
    });
  }

  // Loan 8: Arlene Sutherland - Active Bi-weekly (Dangriga Bakery)
  const l8Schedule = generateSchedule({
    principal: 5000,
    annualRate: 20,
    interestMethod: INTEREST_METHODS.REDUCING,
    termCount: 12,
    frequency: 'BIWEEKLY',
    startDate: '2026-08-01',
    processingFee: 100
  });
  const loan8 = {
    id: 'ln_008',
    loan_number: 'LN-2026-008',
    borrower_id: 'bor_08',
    borrower_name: 'Arlene Sutherland',
    principal: 5000,
    rate: 20,
    interest_method: 'reducing',
    term_count: 12,
    frequency: 'BIWEEKLY',
    start_date: '2026-08-01',
    fees: 100,
    status: 'active',
    created_by: 'Sarah Miller',
    notes: 'Dangriga bakery commercial mixer financing'
  };
  l8Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan8.id, id: `inst_${loan8.id}_${inst.installment_number}` });
  });
  for (let i = 1; i <= 4; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan8.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan8.id}_0${i}`,
      loan_id: loan8.id,
      amount: l8Schedule.installmentAmount,
      date: inst.due_date,
      method: 'bank_transfer',
      received_by: 'Sarah Miller',
      receipt_number: `RCP-BZ-800${i}`,
      notes: `Bakery revenue payment #${i}`,
      timestamp: `${inst.due_date}T10:00:00Z`
    });
  }

  // Loan 9: Dwight Tillett - Overdue 5 days
  const l9Schedule = generateSchedule({
    principal: 1800,
    annualRate: 15,
    interestMethod: INTEREST_METHODS.FLAT,
    termCount: 6,
    frequency: 'MONTHLY',
    startDate: '2026-07-25',
    processingFee: 35
  });
  const loan9 = {
    id: 'ln_009',
    loan_number: 'LN-2026-009',
    borrower_id: 'bor_09',
    borrower_name: 'Dwight Tillett',
    principal: 1800,
    rate: 15,
    interest_method: 'flat',
    term_count: 6,
    frequency: 'MONTHLY',
    start_date: '2026-07-25',
    fees: 35,
    status: 'overdue',
    created_by: 'Carlos Mendez',
    notes: 'Auto repair shop tool kit financing'
  };
  l9Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan9.id, id: `inst_${loan9.id}_${inst.installment_number}` });
  });
  for (let i = 1; i <= 2; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan9.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan9.id}_0${i}`,
      loan_id: loan9.id,
      amount: l9Schedule.installmentAmount,
      date: inst.due_date,
      method: 'cash',
      received_by: 'Carlos Mendez',
      receipt_number: `RCP-BZ-900${i}`,
      notes: `Auto shop mechanic cash receipt #${i}`,
      timestamp: `${inst.due_date}T13:45:00Z`
    });
  }

  // Loan 10: Maria Guitterez - Active Monthly (Punta Gorda)
  const l10Schedule = generateSchedule({
    principal: 2200,
    annualRate: 16,
    interestMethod: INTEREST_METHODS.FLAT,
    termCount: 6,
    frequency: 'MONTHLY',
    startDate: '2026-08-10',
    processingFee: 40
  });
  const loan10 = {
    id: 'ln_010',
    loan_number: 'LN-2026-010',
    borrower_id: 'bor_10',
    borrower_name: 'Maria Guitterez',
    principal: 2200,
    rate: 16,
    interest_method: 'flat',
    term_count: 6,
    frequency: 'MONTHLY',
    start_date: '2026-08-10',
    fees: 40,
    status: 'active',
    created_by: 'Sarah Miller',
    notes: 'Toledo cacao & craft inventory'
  };
  l10Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan10.id, id: `inst_${loan10.id}_${inst.installment_number}` });
  });
  for (let i = 1; i <= 2; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan10.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan10.id}_0${i}`,
      loan_id: loan10.id,
      amount: l10Schedule.installmentAmount,
      date: inst.due_date,
      method: 'bank_transfer',
      received_by: 'Sarah Miller',
      receipt_number: `RCP-BZ-101${i}`,
      notes: `Handicrafts sale proceeds payment #${i}`,
      timestamp: `${inst.due_date}T11:00:00Z`
    });
  }

  // Loan 11: Jamaal Banner - Active Bi-weekly
  const l11Schedule = generateSchedule({
    principal: 1600,
    annualRate: 14,
    interestMethod: INTEREST_METHODS.FLAT,
    termCount: 8,
    frequency: 'BIWEEKLY',
    startDate: '2026-08-20',
    processingFee: 30
  });
  const loan11 = {
    id: 'ln_011',
    loan_number: 'LN-2026-011',
    borrower_id: 'bor_11',
    borrower_name: 'Jamaal Banner',
    principal: 1600,
    rate: 14,
    interest_method: 'flat',
    term_count: 8,
    frequency: 'BIWEEKLY',
    start_date: '2026-08-20',
    fees: 30,
    status: 'active',
    created_by: 'Patrick (Admin/Owner)',
    notes: 'Govt IT staff computer equipment'
  };
  l11Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan11.id, id: `inst_${loan11.id}_${inst.installment_number}` });
  });
  for (let i = 1; i <= 3; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan11.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan11.id}_0${i}`,
      loan_id: loan11.id,
      amount: l11Schedule.installmentAmount,
      date: inst.due_date,
      method: 'bank_transfer',
      received_by: 'Patrick (Admin/Owner)',
      receipt_number: `RCP-BZ-111${i}`,
      notes: `Direct bank salary transfer #${i}`,
      timestamp: `${inst.due_date}T10:00:00Z`
    });
  }

  // Loan 12: Cindy Hyde - PAID OFF
  const l12Schedule = generateSchedule({
    principal: 1000,
    annualRate: 10,
    interestMethod: INTEREST_METHODS.FLAT,
    termCount: 4,
    frequency: 'MONTHLY',
    startDate: '2026-04-15',
    processingFee: 20
  });
  const loan12 = {
    id: 'ln_012',
    loan_number: 'LN-2026-012',
    borrower_id: 'bor_12',
    borrower_name: 'Cindy Hyde',
    principal: 1000,
    rate: 10,
    interest_method: 'flat',
    term_count: 4,
    frequency: 'MONTHLY',
    start_date: '2026-04-15',
    fees: 20,
    status: 'paid_off',
    created_by: 'Sarah Miller',
    notes: 'Short-term medical emergency loan'
  };
  l12Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan12.id, id: `inst_${loan12.id}_${inst.installment_number}` });
  });
  for (let i = 1; i <= 4; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan12.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan12.id}_0${i}`,
      loan_id: loan12.id,
      amount: l12Schedule.installmentAmount,
      date: inst.due_date,
      method: 'cash',
      received_by: 'Sarah Miller',
      receipt_number: `RCP-BZ-121${i}`,
      notes: `Pharmacy counter cash payment #${i}`,
      timestamp: `${inst.due_date}T16:00:00Z`
    });
  }

  // Loan 13: Ricardo Moguel - CRITICAL OVERDUE (72 days overdue, PAR 60+)
  const l13Schedule = generateSchedule({
    principal: 6000,
    annualRate: 24,
    interestMethod: INTEREST_METHODS.FLAT,
    termCount: 12,
    frequency: 'MONTHLY',
    startDate: '2026-05-10',
    processingFee: 100
  });
  const loan13 = {
    id: 'ln_013',
    loan_number: 'LN-2026-013',
    borrower_id: 'bor_13',
    borrower_name: 'Ricardo Moguel',
    principal: 6000,
    rate: 24,
    interest_method: 'flat',
    term_count: 12,
    frequency: 'MONTHLY',
    start_date: '2026-05-10',
    fees: 100,
    status: 'overdue',
    created_by: 'Carlos Mendez',
    notes: 'Heavy haul sugar cane tractor breakdown loan. Non-responsive to calls.'
  };
  l13Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan13.id, id: `inst_${loan13.id}_${inst.installment_number}` });
  });
  // Paid only 1 installment in June
  const l13Inst1 = allInstallments.find(x => x.loan_id === loan13.id && x.installment_number === 1);
  allPayments.push({
    id: `pay_${loan13.id}_01`,
    loan_id: loan13.id,
    amount: l13Schedule.installmentAmount,
    date: l13Inst1.due_date,
    method: 'cash',
    received_by: 'Carlos Mendez',
    receipt_number: 'RCP-BZ-1301',
    notes: 'Initial cash installment',
    timestamp: `${l13Inst1.due_date}T12:00:00Z`
  });
  allCharges.push({
    id: 'chg_003',
    loan_id: loan13.id,
    type: 'late_fee',
    amount: 75.00,
    waived: false,
    reason: 'Arrears charge for 60+ days delinquent status',
    created_at: '2026-08-30'
  });

  // Loan 14: Natasha Bennett - Active Bi-weekly (KHMH Nurse)
  const l14Schedule = generateSchedule({
    principal: 2800,
    annualRate: 16,
    interestMethod: INTEREST_METHODS.REDUCING,
    termCount: 10,
    frequency: 'BIWEEKLY',
    startDate: '2026-08-15',
    processingFee: 50
  });
  const loan14 = {
    id: 'ln_014',
    loan_number: 'LN-2026-014',
    borrower_id: 'bor_14',
    borrower_name: 'Natasha Bennett',
    principal: 2800,
    rate: 16,
    interest_method: 'reducing',
    term_count: 10,
    frequency: 'BIWEEKLY',
    start_date: '2026-08-15',
    fees: 50,
    status: 'active',
    created_by: 'Sarah Miller',
    notes: 'KHMH registered nurse staff advance'
  };
  l14Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan14.id, id: `inst_${loan14.id}_${inst.installment_number}` });
  });
  for (let i = 1; i <= 3; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan14.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan14.id}_0${i}`,
      loan_id: loan14.id,
      amount: l14Schedule.installmentAmount,
      date: inst.due_date,
      method: 'bank_transfer',
      received_by: 'Sarah Miller',
      receipt_number: `RCP-BZ-140${i}`,
      notes: `KHMH payroll transfer #${i}`,
      timestamp: `${inst.due_date}T15:30:00Z`
    });
  }

  // Loan 15: Trevor Leslie - PAID OFF
  const l15Schedule = generateSchedule({
    principal: 1200,
    annualRate: 12,
    interestMethod: INTEREST_METHODS.FLAT,
    termCount: 3,
    frequency: 'MONTHLY',
    startDate: '2026-05-01',
    processingFee: 25
  });
  const loan15 = {
    id: 'ln_015',
    loan_number: 'LN-2026-015',
    borrower_id: 'bor_15',
    borrower_name: 'Trevor Leslie',
    principal: 1200,
    rate: 12,
    interest_method: 'flat',
    term_count: 3,
    frequency: 'MONTHLY',
    start_date: '2026-05-01',
    fees: 25,
    status: 'paid_off',
    created_by: 'Patrick (Admin/Owner)',
    notes: 'Hopkins chef seasonal kitchen tools loan'
  };
  l15Schedule.schedule.forEach(inst => {
    allInstallments.push({ ...inst, loan_id: loan15.id, id: `inst_${loan15.id}_${inst.installment_number}` });
  });
  for (let i = 1; i <= 3; i++) {
    const inst = allInstallments.find(x => x.loan_id === loan15.id && x.installment_number === i);
    allPayments.push({
      id: `pay_${loan15.id}_0${i}`,
      loan_id: loan15.id,
      amount: l15Schedule.installmentAmount,
      date: inst.due_date,
      method: 'mobile_digiwallet',
      received_by: 'Patrick (Admin/Owner)',
      receipt_number: `RCP-BZ-150${i}`,
      notes: `DigiWallet payment installment #${i}`,
      timestamp: `${inst.due_date}T10:45:00Z`
    });
  }

  const rawLoans = [
    loan1, loan2, loan3, loan4, loan5,
    loan6, loan7, loan8, loan9, loan10,
    loan11, loan12, loan13, loan14, loan15
  ];

  // Now run each loan through the recalculateLoanState engine to calculate all live balances
  const processedLoans = [];
  let processedInstallments = [];
  let processedCharges = [];

  for (const rawLoan of rawLoans) {
    const res = recalculateLoanState(rawLoan, allInstallments, allPayments, allCharges);
    processedLoans.push(res.loan);
    processedInstallments = processedInstallments.concat(res.installments);
    processedCharges = processedCharges.concat(res.charges);
  }

  // Create realistic audit logs
  allAuditLogs.push(
    {
      id: 'aud_001',
      action: 'SYSTEM_INIT',
      user: 'Patrick (Owner)',
      target: 'Organization',
      details: 'Initialized Belize QuickLend production ledger',
      timestamp: '2026-08-01T08:00:00Z'
    },
    {
      id: 'aud_002',
      action: 'LOAN_ORIGINATED',
      user: 'Sarah Miller',
      target: 'Loan LN-2026-001 (Elena Martinez)',
      details: 'Originated BZD $1,200.00 microloan with 12 weekly installments',
      timestamp: '2026-08-10T09:30:00Z'
    },
    {
      id: 'aud_003',
      action: 'PAYMENT_RECORDED',
      user: 'Sarah Miller',
      target: 'Loan LN-2026-001',
      details: 'Recorded cash payment BZD $115.00 (Receipt RCP-BZ-1001)',
      timestamp: '2026-08-17T10:15:00Z'
    },
    {
      id: 'aud_004',
      action: 'LATE_FEE_APPLIED',
      user: 'Automated Job',
      target: 'Loan LN-2026-003 (Darrell Young)',
      details: 'Applied fixed late charge of BZD $25.00 for missed installment #3',
      timestamp: '2026-09-20T00:05:00Z'
    },
    {
      id: 'aud_005',
      action: 'WHATSAPP_REMINDER_SENT',
      user: 'Carlos Mendez',
      target: 'Borrower Darrell Young (+501 629-4455)',
      details: 'Triggered overdue WhatsApp notice for balance BZD $1,180.00',
      timestamp: '2026-09-22T14:10:00Z'
    }
  );

  return {
    organization: INITIAL_ORGANIZATION,
    users: INITIAL_USERS,
    borrowers: INITIAL_BORROWERS,
    loans: processedLoans,
    rawInstallments: allInstallments,
    installments: processedInstallments,
    payments: allPayments,
    charges: processedCharges,
    auditLogs: allAuditLogs
  };
}
