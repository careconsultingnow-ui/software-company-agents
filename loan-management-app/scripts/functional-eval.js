/**
 * LendTrack - Automated Functional & Mathematical Evaluation Suite
 * Tests all core requirements from the blueprint specification
 */

import { generateSchedule, INTEREST_METHODS, FREQUENCIES, formatCurrency } from '../src/core/calculator.js';
import { allocatePayment, recalculateLoanState, createReversal } from '../src/core/ledger.js';
import { generateSeedData } from '../src/data/seedData.js';
import { getReminderTemplate, createWhatsAppLink } from '../src/ui/whatsapp.js';
import { parseCSV, importRowsIntoSystem, CSV_SAMPLE_TEMPLATE } from '../src/ui/csvImporter.js';
import { generateThermalReceiptHTML } from '../src/ui/receiptGenerator.js';

console.log('================================================================');
console.log('   LENDTRACK FUNCTIONAL & MATHEMATICAL EVALUATION SUITE');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// Test 1: Seed Dataset & Core Table Schema
// -------------------------------------------------------------
console.log('TEST SUITE 1: Seed Data Architecture & 10 Core Tables');
const seed = generateSeedData();

assert(seed.organization && seed.organization.currency === 'BZD ($)', 'Organization configured with BZD ($) currency');
assert(seed.users && seed.users.length >= 3, `Users present (${seed.users.length} users with owner/officer/collector roles)`);
assert(seed.borrowers && seed.borrowers.length === 15, `15 Pre-seeded Belizean borrowers present (${seed.borrowers.length} loaded)`);
assert(seed.loans && seed.loans.length === 15, `15 Loans initialized across Belize districts (${seed.loans.length} active/overdue/settled)`);
assert(seed.installments && seed.installments.length > 50, `Installment schedule generated (${seed.installments.length} installments)`);
assert(seed.payments && seed.payments.length > 20, `Historical payment ledger populated (${seed.payments.length} verified receipts)`);
assert(seed.charges && seed.charges.length >= 3, `Late fee charges table verified (${seed.charges.length} penalty charges)`);
assert(seed.auditLogs && seed.auditLogs.length >= 5, `Audit log table active (${seed.auditLogs.length} audit entries)`);

// Check district representation
const districts = seed.borrowers.map(b => b.address);
assert(districts.some(d => d.includes('San Ignacio')), 'Borrowers present in Cayo (San Ignacio)');
assert(districts.some(d => d.includes('Belize City')), 'Borrowers present in Belize City');
assert(districts.some(d => d.includes('Belmopan')), 'Borrowers present in Belmopan');
assert(districts.some(d => d.includes('Orange Walk')), 'Borrowers present in Orange Walk');
assert(districts.some(d => d.includes('Placencia')), 'Borrowers present in Stann Creek (Placencia)');

console.log('');

// -------------------------------------------------------------
// Test 2: Interest Calculation Engine (Flat vs Reducing)
// -------------------------------------------------------------
console.log('TEST SUITE 2: Interest Engine & Schedule Generation');

// Flat Rate calculation test: Principal $1200, 15% flat p.a., 12 weekly installments (~0.2307 years)
const flatSched = generateSchedule({
  principal: 1200,
  annualRate: 15,
  interestMethod: INTEREST_METHODS.FLAT,
  termCount: 12,
  frequency: 'WEEKLY',
  startDate: '2026-10-01'
});

assert(flatSched.schedule.length === 12, 'Flat rate generated exact 12 installments');
assert(flatSched.totalInterest > 40 && flatSched.totalInterest < 45, `Flat rate interest computed correctly (${flatSched.totalInterest})`);
assert(flatSched.schedule[0].due_date === '2026-10-08', 'Weekly interval calendar addition (+7 days) verified');
assert(flatSched.schedule[11].remaining_balance === 0, 'Final installment amortizes remaining balance to 0');

// Reducing Balance calculation test: Principal $5000, 24% p.a., 6 monthly installments
const redSched = generateSchedule({
  principal: 5000,
  annualRate: 24,
  interestMethod: INTEREST_METHODS.REDUCING,
  termCount: 6,
  frequency: 'MONTHLY',
  startDate: '2026-10-01'
});

assert(redSched.schedule.length === 6, 'Reducing balance generated 6 monthly installments');
assert(redSched.installmentAmount > 880 && redSched.installmentAmount < 900, `Amortized PMT payment computed accurately ($${redSched.installmentAmount})`);
// Verify that interest decreases over time as principal is paid down
const inst1Interest = redSched.schedule[0].interest_due;
const inst5Interest = redSched.schedule[4].interest_due;
assert(inst1Interest > inst5Interest, `Reducing balance interest decreases over time (Inst 1: $${inst1Interest} > Inst 5: $${inst5Interest})`);
assert(redSched.schedule[5].remaining_balance === 0, 'Final installment amortizes loan principal completely to 0');

console.log('');

// -------------------------------------------------------------
// Test 3: Payment Allocation Waterfall Engine
// -------------------------------------------------------------
console.log('TEST SUITE 3: Payment Allocation Waterfall & Carry-Forward');

const testLoan = { id: 'test_ln_1', loan_number: 'TEST-001', principal: 1000, status: 'active' };
const testInstallments = [
  { id: 'i1', installment_number: 1, due_date: '2026-09-01', principal_due: 150, interest_due: 30, total_due: 180, amount_paid: 0, status: 'pending' },
  { id: 'i2', installment_number: 2, due_date: '2026-10-01', principal_due: 150, interest_due: 30, total_due: 180, amount_paid: 0, status: 'pending' }
];
const testCharges = [
  { id: 'c1', type: 'late_fee', amount: 25.00, amount_paid: 0, waived: false }
];

// Test payment of $200
const allocResult = allocatePayment(testLoan, testInstallments, testCharges, 200.00);

assert(allocResult.allocation.chargesPaid === 25.00, 'Waterfall Priority 1: Unpaid late charges paid first ($25.00)');
assert(allocResult.allocation.interestPaid === 60.00, 'Waterfall Priority 2: Interest across installments paid next ($60.00)');
assert(allocResult.allocation.principalPaid === 115.00, 'Waterfall Priority 3: Remaining funds applied to principal ($115.00)');
assert(allocResult.allocation.chargesPaid + allocResult.allocation.interestPaid + allocResult.allocation.principalPaid === 200.00, 'Total allocation matches received payment of $200.00 exact');

// Test partial payment
const partialResult = allocatePayment(testLoan, testInstallments, [], 100.00);
assert(partialResult.updatedInstallments[0].status === 'partially_paid' || partialResult.updatedInstallments[0].status === 'overdue', 'Partial payment marks installment status accordingly');

console.log('');

// -------------------------------------------------------------
// Test 4: Payment Reversals & Immutable Audit
// -------------------------------------------------------------
console.log('TEST SUITE 4: Payment Reversal & Balance Restoration');

const paymentToReverse = {
  id: 'pay_orig_1',
  loan_id: 'ln_001',
  amount: 115.00,
  receipt_number: 'RCP-BZ-1001',
  method: 'cash'
};

const reversal = createReversal(paymentToReverse, 'Customer Check Bounced', 'Patrick (Owner)');
assert(reversal.amount === -115.00, 'Reversal creates offsetting negative amount transaction (-$115.00)');
assert(reversal.receipt_number === 'REV-RCP-BZ-1001', 'Reversal links to original receipt reference');
assert(reversal.notes.includes('Check Bounced'), 'Reversal preserves audit reason');

console.log('');

// -------------------------------------------------------------
// Test 5: WhatsApp Collections Integration
// -------------------------------------------------------------
console.log('TEST SUITE 5: WhatsApp Click-to-Chat Reminders');

const bOverdue = { name: 'Darrell Young', phone: '+501 629-4455' };
const lOverdue = { loan_number: 'LN-2026-003', total_outstanding: 1180.00 };
const instOverdue = { due_date: '2026-09-15', total_due: 380.00, days_overdue: 19 };

const msg = getReminderTemplate(bOverdue, lOverdue, instOverdue, seed.organization);
assert(msg.includes('Darrell Young'), 'WhatsApp message contains borrower name');
assert(msg.includes('LN-2026-003'), 'WhatsApp message contains loan reference');
assert(msg.includes('19 days ago'), 'WhatsApp message includes exact days overdue');
assert(msg.includes(seed.organization.phone), 'WhatsApp message includes office phone number');

const waLink = createWhatsAppLink(bOverdue.phone, msg);
assert(waLink.startsWith('https://wa.me/5016294455?text='), 'WhatsApp link correctly formats Belize 501 country code');

console.log('');

// -------------------------------------------------------------
// Test 6: CSV Migration & Ingestion Engine
// -------------------------------------------------------------
console.log('TEST SUITE 6: CSV Spreadsheet Migration Wizard');

const parsed = parseCSV(CSV_SAMPLE_TEMPLATE);
assert(parsed.length === 3, `CSV parser extracts exact rows (${parsed.length} rows)`);
assert(parsed[0]['Borrower Name'] === 'Eusebio Mendez', 'CSV row 1 borrower parsed correctly');
assert(parsed[0]['Principal'] === '2500', 'CSV principal parsed correctly');

const importResult = importRowsIntoSystem(parsed, seed);
assert(importResult.importedLoansCount === 3, 'Import wizard successfully ingested 3 active loans');
assert(importResult.borrowers.some(b => b.name === 'Eusebio Mendez'), 'New borrower Eusebio Mendez added to directory');
assert(importResult.auditLogs[0].action === 'CSV_BATCH_IMPORT', 'CSV batch import logged in audit trail');

console.log('');

// -------------------------------------------------------------
// Test 7: 80mm Thermal Receipt Generator
// -------------------------------------------------------------
console.log('TEST SUITE 7: 80mm POS Thermal Receipt Generation');

const receiptHTML = generateThermalReceiptHTML({
  organization: seed.organization,
  payment: { id: 'p1', receipt_number: 'RCP-BZ-9901', amount: 260.00, method: 'cash', date: '2026-10-04' },
  loan: { loan_number: 'LN-2026-001', total_outstanding: 940.00 },
  borrower: { name: 'Elena Martinez' },
  allocationBreakdown: { chargesPaid: 0, interestPaid: 60.00, principalPaid: 200.00 }
});

assert(receiptHTML.includes('Belize QuickLend Financial Services'), 'Receipt includes organization branding');
assert(receiptHTML.includes('RCP-BZ-9901'), 'Receipt includes receipt number');
assert(receiptHTML.includes('Elena Martinez'), 'Receipt includes borrower name');
assert(receiptHTML.includes('REMAINING BALANCE'), 'Receipt includes remaining balance disclosure');
assert(receiptHTML.includes('thermal-receipt-doc'), 'Receipt includes 80mm thermal print container identifier');

console.log('\n================================================================');
console.log(`   EVALUATION RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('STATUS: ALL FUNCTIONAL SPECIFICATIONS VERIFIED 100% SUCCESFUL.');
}
