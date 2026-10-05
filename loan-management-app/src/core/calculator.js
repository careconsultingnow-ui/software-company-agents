/**
 * LendTrack - Core Financial Calculation Engine
 * Supports Flat Rate Interest and Reducing Balance (Amortized PMT) schedules
 * Supports Weekly, Bi-weekly, and Monthly frequencies
 */

export const FREQUENCIES = {
  WEEKLY: { label: 'Weekly', periodsPerYear: 52, daysInterval: 7 },
  BIWEEKLY: { label: 'Bi-weekly (Fortnightly)', periodsPerYear: 26, daysInterval: 14 },
  MONTHLY: { label: 'Monthly', periodsPerYear: 12, daysInterval: 30 }
};

export const INTEREST_METHODS = {
  FLAT: 'flat',
  REDUCING: 'reducing'
};

/**
 * Adds interval to date based on frequency
 * @param {Date|string} startDate 
 * @param {number} installmentIndex 1-based index
 * @param {string} frequency 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
 * @returns {string} YYYY-MM-DD
 */
export function calculateDueDate(startDate, installmentIndex, frequency = 'MONTHLY') {
  const parts = String(startDate).split('T')[0].split('-').map(Number);
  const y = parts[0];
  const m = parts[1] - 1; // 0-indexed month
  const day = parts[2];
  const d = new Date(y, m, day, 12, 0, 0);

  if (frequency === 'WEEKLY') {
    d.setDate(d.getDate() + (installmentIndex * 7));
  } else if (frequency === 'BIWEEKLY') {
    d.setDate(d.getDate() + (installmentIndex * 14));
  } else {
    // Monthly: increment month
    d.setMonth(d.getMonth() + installmentIndex);
    // Handle month-end rollover if original date had day 31 and next month has 30 or 28
    if (d.getDate() !== day && day <= 31) {
      d.setDate(0); // set to last day of previous month
    }
  }

  const resYear = d.getFullYear();
  const resMonth = String(d.getMonth() + 1).padStart(2, '0');
  const resDate = String(d.getDate()).padStart(2, '0');
  return `${resYear}-${resMonth}-${resDate}`;
}

/**
 * Format currency
 * @param {number} amount 
 * @param {string} currency Symbol e.g. '$'
 * @returns {string}
 */
export function formatCurrency(amount, currency = '$') {
  const val = Number(amount) || 0;
  return `${currency} ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Generates loan schedule
 * 
 * @param {Object} params
 * @param {number} params.principal Loan amount
 * @param {number} params.annualRate Annual or Term interest rate percentage (e.g., 24 for 24% p.a. or 10 for 10% flat)
 * @param {string} params.interestMethod 'flat' | 'reducing'
 * @param {number} params.termCount Number of installments (e.g. 12 months or 26 fortnights)
 * @param {string} params.frequency 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
 * @param {string} params.startDate YYYY-MM-DD
 * @param {number} [params.processingFee=0] Upfront fee
 * @returns {Object} Summary + array of installment objects
 */
export function generateSchedule({
  principal,
  annualRate,
  interestMethod = INTEREST_METHODS.FLAT,
  termCount,
  frequency = 'MONTHLY',
  startDate = new Date().toISOString().split('T')[0],
  processingFee = 0
}) {
  const p = Number(principal);
  const rate = Number(annualRate);
  const n = parseInt(termCount, 10);
  const fee = Number(processingFee) || 0;
  const freqConfig = FREQUENCIES[frequency] || FREQUENCIES.MONTHLY;

  if (!p || p <= 0 || !n || n <= 0) {
    return {
      principal: 0,
      totalInterest: 0,
      totalRepayment: 0,
      processingFee: fee,
      installmentAmount: 0,
      schedule: []
    };
  }

  const schedule = [];
  let totalInterest = 0;

  if (interestMethod === INTEREST_METHODS.FLAT) {
    // FLAT RATE:
    // Rate is treated as annual rate or periodic flat percentage
    // Total interest = Principal * (annualRate / 100) * (duration in years)
    const durationInYears = n / freqConfig.periodsPerYear;
    totalInterest = Math.round((p * (rate / 100) * durationInYears) * 100) / 100;
    const totalRepayment = p + totalInterest;

    const basePrincipalPerPeriod = Math.floor((p / n) * 100) / 100;
    const baseInterestPerPeriod = Math.floor((totalInterest / n) * 100) / 100;

    let remainingPrincipal = p;

    for (let i = 1; i <= n; i++) {
      const isLast = i === n;
      const principalDue = isLast
        ? Math.round(remainingPrincipal * 100) / 100
        : basePrincipalPerPeriod;
      
      const interestDue = isLast
        ? Math.round((totalInterest - (baseInterestPerPeriod * (n - 1))) * 100) / 100
        : baseInterestPerPeriod;

      const totalDue = Math.round((principalDue + interestDue) * 100) / 100;
      remainingPrincipal = Math.max(0, Math.round((remainingPrincipal - principalDue) * 100) / 100);

      schedule.push({
        installment_number: i,
        due_date: calculateDueDate(startDate, i, frequency),
        principal_due: principalDue,
        interest_due: interestDue,
        fees_due: 0,
        total_due: totalDue,
        principal_paid: 0,
        interest_paid: 0,
        fees_paid: 0,
        amount_paid: 0,
        remaining_balance: remainingPrincipal,
        status: 'pending' // 'pending' | 'paid' | 'partially_paid' | 'overdue'
      });
    }

    return {
      principal: p,
      totalInterest,
      totalRepayment,
      processingFee: fee,
      installmentAmount: schedule[0] ? schedule[0].total_due : 0,
      frequency,
      interestMethod,
      schedule
    };
  } else {
    // REDUCING BALANCE (Equal Periodic Amortization - PMT)
    // Periodic interest rate
    const periodicRate = (rate / 100) / freqConfig.periodsPerYear;
    
    let pmt = 0;
    if (periodicRate === 0) {
      pmt = p / n;
    } else {
      pmt = p * (periodicRate * Math.pow(1 + periodicRate, n)) / (Math.pow(1 + periodicRate, n) - 1);
    }
    pmt = Math.round(pmt * 100) / 100;

    let remainingBalance = p;

    for (let i = 1; i <= n; i++) {
      const isLast = i === n;
      const interestDue = Math.round((remainingBalance * periodicRate) * 100) / 100;
      let principalDue = isLast
        ? remainingBalance
        : Math.round((pmt - interestDue) * 100) / 100;

      // In case principal exceeds remaining balance
      if (principalDue > remainingBalance) {
        principalDue = remainingBalance;
      }

      const totalDue = Math.round((principalDue + interestDue) * 100) / 100;
      remainingBalance = Math.max(0, Math.round((remainingBalance - principalDue) * 100) / 100);
      totalInterest += interestDue;

      schedule.push({
        installment_number: i,
        due_date: calculateDueDate(startDate, i, frequency),
        principal_due: principalDue,
        interest_due: interestDue,
        fees_due: 0,
        total_due: totalDue,
        principal_paid: 0,
        interest_paid: 0,
        fees_paid: 0,
        amount_paid: 0,
        remaining_balance: remainingBalance,
        status: 'pending'
      });
    }

    totalInterest = Math.round(totalInterest * 100) / 100;
    const totalRepayment = Math.round((p + totalInterest) * 100) / 100;

    return {
      principal: p,
      totalInterest,
      totalRepayment,
      processingFee: fee,
      installmentAmount: pmt,
      frequency,
      interestMethod,
      schedule
    };
  }
}
