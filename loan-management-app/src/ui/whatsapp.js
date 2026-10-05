/**
 * LendTrack - WhatsApp Collections & Messaging Integration
 * Generates direct wa.me click-to-chat links with pre-populated contextual reminders
 */

import { formatCurrency } from '../core/calculator.js';

export function getReminderTemplate(borrower, loan, installment, org) {
  const daysOverdue = installment?.days_overdue || 0;
  const currency = org?.currency_symbol || '$';
  const amountDue = formatCurrency(installment?.total_due || loan?.total_outstanding || 0, currency);
  const loanNo = loan?.loan_number || 'Loan';
  const orgName = org?.name || 'QuickLend';

  let tone = 'polite';
  if (daysOverdue > 30) {
    tone = 'formal_critical';
  } else if (daysOverdue > 14) {
    tone = 'urgent';
  } else if (daysOverdue > 3) {
    tone = 'notice';
  }

  let message = '';

  switch (tone) {
    case 'formal_critical':
      message = `*FINAL URGENT NOTICE - ${orgName}*\n\n` +
        `Dear ${borrower.name},\n` +
        `Your account for ${loanNo} is severely delinquent by *${daysOverdue} days* with an outstanding balance of *${amountDue}*.\n\n` +
        `Please contact our office immediately at ${org.phone} or visit us at ${org.address} to avoid collateral action and guarantor contact.\n\n` +
        `Thank you,\n${orgName} Collections`;
      break;

    case 'urgent':
      message = `*OVERDUE PAYMENT NOTICE - ${orgName}*\n\n` +
        `Hello ${borrower.name},\n` +
        `This is a follow-up regarding your payment for ${loanNo}, which was due on ${installment.due_date} (${daysOverdue} days ago).\n\n` +
        `The current amount due is *${amountDue}* (including applicable late fees).\n\n` +
        `Kindly make your payment today or send proof of transfer. Reply here or call ${org.phone} if you need assistance.`;
      break;

    case 'notice':
      message = `*Payment Reminder - ${orgName}*\n\n` +
        `Hi ${borrower.name},\n` +
        `Just a reminder that your installment of *${amountDue}* for ${loanNo} is past due (${daysOverdue} days).\n\n` +
        `Please make this payment at your earliest convenience to maintain your good standing and avoid additional late charges.\n\n` +
        `Have a great day!`;
      break;

    case 'polite':
    default:
      message = `*Upcoming Payment Reminder - ${orgName}*\n\n` +
        `Hi ${borrower.name},\n` +
        `This is a courtesy reminder that your next installment of *${amountDue}* for ${loanNo} is due on *${installment?.due_date || 'soon'}*.\n\n` +
        `Thank you for keeping your account current!`;
      break;
  }

  return message;
}

/**
 * Creates clean wa.me link
 * @param {string} phone e.g. "+501 622-1144"
 * @param {string} messageText 
 * @returns {string} https://wa.me/...
 */
export function createWhatsAppLink(phone, messageText) {
  // Strip non-digits
  let cleanPhone = (phone || '').replace(/\D/g, '');
  
  // If Belize 7-digit local number without country code, prefix 501
  if (cleanPhone.length === 7) {
    cleanPhone = `501${cleanPhone}`;
  }

  const encoded = encodeURIComponent(messageText);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}
