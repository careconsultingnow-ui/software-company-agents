/**
 * LendTrack - Ledger and Payment Allocation Waterfall Engine
 * Handles payment recording, waterfall distribution, payment reversals, and late-fee checks
 */

/**
 * Allocates a payment across loan obligations using standard waterfall logic:
 * 1. Unpaid charges (Late fees, penalties)
 * 2. Unpaid/Overdue interest
 * 3. Unpaid/Overdue principal
 * 4. Excess prepayment to outstanding principal
 * 
 * @param {Object} loan 
 * @param {Array} installments 
 * @param {Array} charges 
 * @param {number} paymentAmount 
 * @returns {Object} { allocationBreakdown, updatedInstallments, updatedCharges, remainingExcess }
 */
export function allocatePayment(loan, installments, charges, paymentAmount) {
  let unallocated = Math.round(Number(paymentAmount) * 100) / 100;
  
  const allocation = {
    chargesPaid: 0,
    interestPaid: 0,
    principalPaid: 0,
    excessPrincipal: 0,
    chargeDetails: [],
    installmentDetails: []
  };

  // Clone structures to avoid direct mutations
  const updatedCharges = charges.map(c => ({ ...c }));
  const updatedInstallments = installments.map(inst => ({ ...inst }));

  // 1. Pay Unpaid Charges first (e.g. late fees, processing fees)
  for (const charge of updatedCharges) {
    if (unallocated <= 0) break;
    if (charge.waived) continue;
    
    const chargeOutstanding = Math.round(((charge.amount || 0) - (charge.amount_paid || 0)) * 100) / 100;
    if (chargeOutstanding > 0) {
      const payTowardsCharge = Math.min(unallocated, chargeOutstanding);
      charge.amount_paid = Math.round(((charge.amount_paid || 0) + payTowardsCharge) * 100) / 100;
      unallocated = Math.round((unallocated - payTowardsCharge) * 100) / 100;
      allocation.chargesPaid = Math.round((allocation.chargesPaid + payTowardsCharge) * 100) / 100;
      allocation.chargeDetails.push({
        charge_id: charge.id,
        type: charge.type,
        amount_paid: payTowardsCharge
      });
    }
  }

  // Sort installments chronologically by installment number
  updatedInstallments.sort((a, b) => a.installment_number - b.installment_number);

  // 2. Pay Interest across unpaid/partially paid installments
  for (const inst of updatedInstallments) {
    if (unallocated <= 0) break;
    const interestDue = inst.interest_due || 0;
    const interestAlreadyPaid = inst.interest_paid || 0;
    const interestRemaining = Math.max(0, Math.round((interestDue - interestAlreadyPaid) * 100) / 100);

    if (interestRemaining > 0) {
      const payInterest = Math.min(unallocated, interestRemaining);
      inst.interest_paid = Math.round((interestAlreadyPaid + payInterest) * 100) / 100;
      inst.amount_paid = Math.round(((inst.amount_paid || 0) + payInterest) * 100) / 100;
      unallocated = Math.round((unallocated - payInterest) * 100) / 100;
      allocation.interestPaid = Math.round((allocation.interestPaid + payInterest) * 100) / 100;
    }
  }

  // 3. Pay Principal across unpaid/partially paid installments
  for (const inst of updatedInstallments) {
    if (unallocated <= 0) break;
    const principalDue = inst.principal_due || 0;
    const principalAlreadyPaid = inst.principal_paid || 0;
    const principalRemaining = Math.max(0, Math.round((principalDue - principalAlreadyPaid) * 100) / 100);

    if (principalRemaining > 0) {
      const payPrincipal = Math.min(unallocated, principalRemaining);
      inst.principal_paid = Math.round((principalAlreadyPaid + payPrincipal) * 100) / 100;
      inst.amount_paid = Math.round(((inst.amount_paid || 0) + payPrincipal) * 100) / 100;
      unallocated = Math.round((unallocated - payPrincipal) * 100) / 100;
      allocation.principalPaid = Math.round((allocation.principalPaid + payPrincipal) * 100) / 100;
    }
  }

  // 4. Excess prepayment (if any) -> reduces remaining loan principal balance
  if (unallocated > 0) {
    allocation.excessPrincipal = unallocated;
    allocation.principalPaid = Math.round((allocation.principalPaid + unallocated) * 100) / 100;
    unallocated = 0;
  }

  // Update status for all installments
  const todayStr = new Date().toISOString().split('T')[0];
  for (const inst of updatedInstallments) {
    const totalDue = inst.total_due || 0;
    const totalPaid = inst.amount_paid || 0;

    if (totalPaid >= totalDue) {
      inst.status = 'paid';
    } else if (totalPaid > 0) {
      inst.status = inst.due_date < todayStr ? 'overdue' : 'partially_paid';
    } else {
      inst.status = inst.due_date < todayStr ? 'overdue' : 'pending';
    }
  }

  return {
    allocation,
    updatedInstallments,
    updatedCharges,
    remainingExcess: unallocated
  };
}

/**
 * Recomputes all balances, status, and installment states for a loan from its transactions
 * @param {Object} loan 
 * @param {Array} rawInstallments 
 * @param {Array} allPayments 
 * @param {Array} allCharges 
 * @returns {Object} { loan, installments, charges }
 */
export function recalculateLoanState(loan, rawInstallments, allPayments, allCharges) {
  // Filter active payments (ignore reversed payments)
  const activePayments = (allPayments || [])
    .filter(p => p.loan_id === loan.id && !p.reversed)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const loanCharges = (allCharges || [])
    .filter(c => c.loan_id === loan.id)
    .map(c => ({ ...c, amount_paid: 0 }));

  // Reset installments to clean zero-paid state
  let currentInstallments = rawInstallments
    .filter(i => i.loan_id === loan.id)
    .map(inst => ({
      ...inst,
      principal_paid: 0,
      interest_paid: 0,
      fees_paid: 0,
      amount_paid: 0,
      status: 'pending'
    }))
    .sort((a, b) => a.installment_number - b.installment_number);

  let totalPaidSoFar = 0;

  // Replay each payment sequentially through waterfall
  for (const payment of activePayments) {
    const result = allocatePayment(loan, currentInstallments, loanCharges, payment.amount);
    currentInstallments = result.updatedInstallments;
    // update loan charges in place
    result.updatedCharges.forEach(upd => {
      const idx = loanCharges.findIndex(c => c.id === upd.id);
      if (idx !== -1) loanCharges[idx] = upd;
    });
    totalPaidSoFar += payment.amount;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Refresh overdue status if not fully paid
  for (const inst of currentInstallments) {
    if (inst.amount_paid >= inst.total_due) {
      inst.status = 'paid';
    } else if (inst.amount_paid > 0) {
      inst.status = inst.due_date < todayStr ? 'overdue' : 'partially_paid';
    } else {
      inst.status = inst.due_date < todayStr ? 'overdue' : 'pending';
    }
  }

  // Calculate current balances
  const totalPrincipalDue = currentInstallments.reduce((sum, i) => sum + (i.principal_due || 0), 0);
  const totalPrincipalPaid = currentInstallments.reduce((sum, i) => sum + (i.principal_paid || 0), 0);
  const totalInterestDue = currentInstallments.reduce((sum, i) => sum + (i.interest_due || 0), 0);
  const totalInterestPaid = currentInstallments.reduce((sum, i) => sum + (i.interest_paid || 0), 0);

  const totalChargesDue = loanCharges.filter(c => !c.waived).reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalChargesPaid = loanCharges.filter(c => !c.waived).reduce((sum, c) => sum + (c.amount_paid || 0), 0);

  const outstandingPrincipal = Math.max(0, Math.round((totalPrincipalDue - totalPrincipalPaid) * 100) / 100);
  const outstandingInterest = Math.max(0, Math.round((totalInterestDue - totalInterestPaid) * 100) / 100);
  const outstandingCharges = Math.max(0, Math.round((totalChargesDue - totalChargesPaid) * 100) / 100);
  const totalOutstanding = Math.round((outstandingPrincipal + outstandingInterest + outstandingCharges) * 100) / 100;

  // Determine overall loan status
  let newLoanStatus = 'active';
  const hasOverdueInstallments = currentInstallments.some(i => i.status === 'overdue');
  
  if (totalOutstanding <= 0) {
    newLoanStatus = 'paid_off';
  } else if (hasOverdueInstallments) {
    newLoanStatus = 'overdue';
  } else {
    newLoanStatus = 'active';
  }

  const updatedLoan = {
    ...loan,
    total_paid: Math.round(totalPaidSoFar * 100) / 100,
    outstanding_principal: outstandingPrincipal,
    outstanding_interest: outstandingInterest,
    outstanding_charges: outstandingCharges,
    total_outstanding: totalOutstanding,
    status: newLoanStatus
  };

  return {
    loan: updatedLoan,
    installments: currentInstallments,
    charges: loanCharges
  };
}

/**
 * Creates a reverse payment transaction with immutable audit trail
 * @param {Object} originalPayment 
 * @param {string} reason 
 * @param {string} reversedBy 
 * @returns {Object} Reversal payment record
 */
export function createReversal(originalPayment, reason, reversedBy = 'Admin') {
  return {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    loan_id: originalPayment.loan_id,
    amount: -Math.abs(originalPayment.amount),
    date: new Date().toISOString().split('T')[0],
    method: originalPayment.method,
    received_by: reversedBy,
    receipt_number: `REV-${originalPayment.receipt_number || originalPayment.id}`,
    notes: `REVERSAL of payment ${originalPayment.receipt_number}. Reason: ${reason}`,
    is_reversal: true,
    original_payment_id: originalPayment.id,
    timestamp: new Date().toISOString()
  };
}
