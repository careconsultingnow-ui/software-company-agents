/**
 * LendTrack - CSV Spreadsheet Importer
 * Enables lenders to migrate spreadsheet borrower/loan data in minutes
 */

import { generateSchedule, INTEREST_METHODS } from '../core/calculator.js';
import { recalculateLoanState } from '../core/ledger.js';

export const CSV_SAMPLE_TEMPLATE = `Borrower Name,Phone,Address,Employer,Principal,Interest Rate,Interest Method,Term Count,Frequency,Start Date
Eusebio Mendez,+501 622-4411,Orange Walk Town,Sugar Cane Hauler,2500,20,flat,12,monthly,2026-09-01
Kareem Williams,+501 610-9922,Belize City,Port Authority Officer,1500,15,flat,6,biweekly,2026-09-15
Maricela Cruz,+501 628-7733,San Ignacio,Market Vendor,800,12,flat,8,weekly,2026-09-20`;

/**
 * Parses CSV text to array of objects
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle quotes properly
    const rowValues = [];
    let insideQuotes = false;
    let currentVal = '';

    for (const char of lines[i]) {
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        rowValues.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    rowValues.push(currentVal.trim());

    if (rowValues.length >= 5) {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = rowValues[idx] || '';
      });
      rows.push(obj);
    }
  }

  return rows;
}

/**
 * Converts parsed CSV rows into Borrowers and Loans
 */
export function importRowsIntoSystem(rows, currentData) {
  let importedBorrowersCount = 0;
  let importedLoansCount = 0;

  const newBorrowers = [...currentData.borrowers];
  const newLoans = [...currentData.loans];
  let newInstallments = [...currentData.installments];
  const newAuditLogs = [...currentData.auditLogs];

  const now = new Date();

  rows.forEach((row, index) => {
    const name = row['Borrower Name'] || row['name'] || `Borrower ${index + 1}`;
    const phone = row['Phone'] || row['phone'] || '+501 600-0000';
    const address = row['Address'] || row['address'] || 'Belize';
    const employer = row['Employer'] || row['employer'] || 'General Employment';
    const principal = parseFloat(row['Principal'] || row['principal'] || 1000);
    const rate = parseFloat(row['Interest Rate'] || row['rate'] || 18);
    const methodStr = (row['Interest Method'] || row['method'] || 'flat').toLowerCase();
    const interestMethod = methodStr.includes('reduc') ? INTEREST_METHODS.REDUCING : INTEREST_METHODS.FLAT;
    const termCount = parseInt(row['Term Count'] || row['term'] || 6, 10);
    const freqRaw = (row['Frequency'] || row['frequency'] || 'monthly').toUpperCase();
    const frequency = freqRaw.includes('WEEK') ? (freqRaw.includes('BI') ? 'BIWEEKLY' : 'WEEKLY') : 'MONTHLY';
    const startDate = row['Start Date'] || row['start_date'] || now.toISOString().split('T')[0];

    // Check if borrower already exists by name or create
    let borrower = newBorrowers.find(b => b.name.toLowerCase() === name.toLowerCase());
    if (!borrower) {
      borrower = {
        id: `bor_imp_${Date.now()}_${index}`,
        name,
        id_number: `IMP-${Math.floor(100000 + Math.random() * 900000)}`,
        phone,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@client.bz`,
        address,
        employer,
        guarantor: 'Refer to original spreadsheet record',
        notes: 'Imported via CSV migration wizard',
        status: 'active',
        rating: 'good'
      };
      newBorrowers.push(borrower);
      importedBorrowersCount++;
    }

    // Generate schedule
    const scheduleResult = generateSchedule({
      principal,
      annualRate: rate,
      interestMethod,
      termCount,
      frequency,
      startDate,
      processingFee: 30
    });

    const loanId = `ln_imp_${Date.now()}_${index}`;
    const loanNumber = `LN-IMP-${100 + newLoans.length + 1}`;

    const rawLoan = {
      id: loanId,
      loan_number: loanNumber,
      borrower_id: borrower.id,
      borrower_name: borrower.name,
      principal,
      rate,
      interest_method: interestMethod,
      term_count: termCount,
      frequency,
      start_date: startDate,
      fees: 30,
      status: 'active',
      created_by: 'CSV Import Wizard',
      notes: `Batch imported from spreadsheet on ${now.toISOString().split('T')[0]}`
    };

    const loanInstallments = scheduleResult.schedule.map(inst => ({
      ...inst,
      id: `inst_${loanId}_${inst.installment_number}`,
      loan_id: loanId
    }));

    newInstallments = newInstallments.concat(loanInstallments);

    const recomputed = recalculateLoanState(rawLoan, newInstallments, currentData.payments, currentData.charges);
    newLoans.push(recomputed.loan);
    importedLoansCount++;
  });

  newAuditLogs.unshift({
    id: `aud_imp_${Date.now()}`,
    action: 'CSV_BATCH_IMPORT',
    user: 'Patrick (Owner)',
    target: `${importedLoansCount} Loans`,
    details: `Successfully imported ${importedBorrowersCount} new borrowers and ${importedLoansCount} active loans via CSV`,
    timestamp: now.toISOString()
  });

  return {
    ...currentData,
    borrowers: newBorrowers,
    loans: newLoans,
    installments: newInstallments,
    auditLogs: newAuditLogs,
    importedBorrowersCount,
    importedLoansCount
  };
}
