/**
 * LendTrack - Receipt & Statement Generator
 * Generates 80mm POS Thermal Receipts and 8.5x11 Borrower Account Statements
 */

import { formatCurrency } from '../core/calculator.js';

/**
 * Builds HTML for 80mm thermal receipt
 */
export function generateThermalReceiptHTML({
  organization,
  payment,
  loan,
  borrower,
  allocationBreakdown
}) {
  const curr = organization.currency_symbol || '$';
  const payDate = payment.date || new Date().toISOString().split('T')[0];
  const pMethod = (payment.method || 'cash').toUpperCase().replace('_', ' ');

  return `
    <div class="receipt-wrapper printable-area" id="thermal-receipt-doc">
      <div class="receipt-header">
        <div class="receipt-org-name">${organization.name}</div>
        <div class="receipt-meta">${organization.address}</div>
        <div class="receipt-meta">Tel: ${organization.phone}</div>
        <div class="receipt-meta" style="margin-top: 4px; font-weight: 700;">OFFICIAL PAYMENT RECEIPT</div>
      </div>

      <div class="receipt-row">
        <span>Receipt #:</span>
        <span style="font-weight: 700;">${payment.receipt_number}</span>
      </div>
      <div class="receipt-row">
        <span>Date/Time:</span>
        <span>${payDate}</span>
      </div>
      <div class="receipt-row">
        <span>Loan Ref:</span>
        <span style="font-weight: 700;">${loan.loan_number}</span>
      </div>
      <div class="receipt-row">
        <span>Borrower:</span>
        <span style="font-weight: 700;">${borrower.name}</span>
      </div>
      <div class="receipt-row">
        <span>Payment Method:</span>
        <span>${pMethod}</span>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-row receipt-total">
        <span>TOTAL RECEIVED:</span>
        <span>${formatCurrency(payment.amount, curr)}</span>
      </div>

      <div class="receipt-divider"></div>

      <div style="font-size: 0.7rem; color: #4B5563; margin-bottom: 4px; font-weight: 700; text-transform: uppercase;">
        Allocation Breakdown:
      </div>

      ${allocationBreakdown?.chargesPaid > 0 ? `
      <div class="receipt-row" style="font-size: 0.75rem;">
        <span>- Late Fees & Charges:</span>
        <span>${formatCurrency(allocationBreakdown.chargesPaid, curr)}</span>
      </div>` : ''}

      <div class="receipt-row" style="font-size: 0.75rem;">
        <span>- Interest Applied:</span>
        <span>${formatCurrency(allocationBreakdown?.interestPaid || 0, curr)}</span>
      </div>

      <div class="receipt-row" style="font-size: 0.75rem;">
        <span>- Principal Reduction:</span>
        <span>${formatCurrency(allocationBreakdown?.principalPaid || 0, curr)}</span>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-row" style="font-weight: 700;">
        <span>REMAINING BALANCE:</span>
        <span>${formatCurrency(loan.total_outstanding || 0, curr)}</span>
      </div>

      <div class="receipt-footer">
        <div>Received by: ${payment.received_by || 'Officer'}</div>
        <div style="margin-top: 4px;">*** KEEP THIS RECEIPT FOR YOUR RECORDS ***</div>
        <div style="margin-top: 2px;">Thank you for your business!</div>
      </div>
    </div>
  `;
}

/**
 * Triggers native browser print dialog specifically targeting the receipt
 */
export function printReceipt() {
  window.print();
}
