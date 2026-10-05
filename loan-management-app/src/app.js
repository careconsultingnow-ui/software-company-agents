/**
 * LendTrack - Core Application Controller
 * Handles view routing, state mutations, live preview calculation, and modals
 */

import {
  formatCurrency,
  generateSchedule,
  INTEREST_METHODS,
  FREQUENCIES
} from './core/calculator.js';

import {
  allocatePayment,
  recalculateLoanState,
  createReversal
} from './core/ledger.js';

import {
  getStoredData,
  saveStoredData,
  resetToSeedData,
  addAuditLog
} from './core/storage.js';

import {
  getReminderTemplate,
  createWhatsAppLink
} from './ui/whatsapp.js';

import {
  generateThermalReceiptHTML,
  printReceipt
} from './ui/receiptGenerator.js';

import {
  parseCSV,
  importRowsIntoSystem,
  CSV_SAMPLE_TEMPLATE
} from './ui/csvImporter.js';

import {
  renderLandingPageView
} from './ui/landingPage.js';

// Application Global State
let state = getStoredData();
let currentTab = 'dashboard';
let selectedLoanId = state.loans[0]?.id || null;
let currentUser = 'Patrick (Owner)';

// Currency helper
function curr(amount) {
  return formatCurrency(amount, state.organization?.currency_symbol || '$');
}

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.innerHTML = `
    <span style="font-weight: 700;">${type === 'error' ? '⚠️' : '✓'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Update Top KPI Ticker
function updateHeaderTicker() {
  const activeLoans = state.loans.filter(l => l.status !== 'paid_off');
  const totalPortfolio = activeLoans.reduce((sum, l) => sum + (l.total_outstanding || 0), 0);
  
  // Current month collections
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const mtdPayments = state.payments
    .filter(p => !p.reversed && p.date && p.date.startsWith(currentMonthPrefix))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const overdueLoans = state.loans.filter(l => l.status === 'overdue');

  const tickerPort = document.getElementById('ticker-portfolio');
  const tickerColl = document.getElementById('ticker-collected');
  const tickerOver = document.getElementById('ticker-overdue');
  const tabOverdueBadge = document.getElementById('tab-overdue-count');

  if (tickerPort) tickerPort.textContent = curr(totalPortfolio);
  if (tickerColl) tickerColl.textContent = curr(mtdPayments);
  if (tickerOver) tickerOver.textContent = `${overdueLoans.length} Loans`;
  if (tabOverdueBadge) tabOverdueBadge.textContent = overdueLoans.length;
}

// Tab Switcher Controller
function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  const main = document.getElementById('main-content');
  if (!main) return;

  switch (tabName) {
    case 'dashboard':
      renderDashboard(main);
      break;
    case 'borrowers':
      renderBorrowers(main);
      break;
    case 'new-loan':
      renderNewLoan(main);
      break;
    case 'loan-ledger':
      renderLoanLedger(main);
      break;
    case 'overdue':
      renderOverdue(main);
      break;
    case 'reports':
      renderReports(main);
      break;
    case 'csv-importer':
      renderCSVImporter(main);
      break;
    case 'audit-log':
      renderAuditLog(main);
      break;
    case 'landing':
      main.innerHTML = renderLandingPageView();
      attachLandingPageListeners();
      break;
    default:
      renderDashboard(main);
  }

  updateHeaderTicker();
}

/* ==========================================================================
   VIEW 1: DASHBOARD
   ========================================================================== */
function renderDashboard(container) {
  const activeLoans = state.loans.filter(l => l.status !== 'paid_off');
  const overdueLoans = state.loans.filter(l => l.status === 'overdue');
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.total_outstanding || 0), 0);
  const overdueOutstanding = overdueLoans.reduce((sum, l) => sum + (l.total_outstanding || 0), 0);
  const parRate = totalOutstanding > 0 ? Math.round((overdueOutstanding / totalOutstanding) * 1000) / 10 : 0;

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const mtdCollected = state.payments
    .filter(p => !p.reversed && p.date && p.date.startsWith(currentMonthPrefix))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Today & upcoming due installments
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingInstallments = state.installments
    .filter(i => i.status !== 'paid')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 6);

  // Recent payments
  const recentPayments = [...state.payments]
    .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
    .slice(0, 5);

  container.innerHTML = `
    <!-- Top Stat Cards -->
    <div class="grid-cols-4">
      <div class="card stat-card" style="--card-accent: #10B981;">
        <div class="stat-header">
          <span class="stat-title">Active Portfolio</span>
          <div class="stat-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
        <div class="stat-value" style="color: #34D399;">${curr(totalOutstanding)}</div>
        <div class="stat-sub">Across ${activeLoans.length} active borrowers</div>
      </div>

      <div class="card stat-card" style="--card-accent: #3B82F6;">
        <div class="stat-header">
          <span class="stat-title">Collected This Month</span>
          <div class="stat-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
        <div class="stat-value" style="color: #60A5FA;">${curr(mtdCollected)}</div>
        <div class="stat-sub">MTD Cash & Bank Inflows</div>
      </div>

      <div class="card stat-card" style="--card-accent: #EF4444;">
        <div class="stat-header">
          <span class="stat-title">Delinquency (PAR)</span>
          <div class="stat-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
        </div>
        <div class="stat-value" style="color: #F87171;">${parRate}%</div>
        <div class="stat-sub">${overdueLoans.length} accounts (${curr(overdueOutstanding)}) in arrears</div>
      </div>

      <div class="card stat-card" style="--card-accent: #8B5CF6;">
        <div class="stat-header">
          <span class="stat-title">Borrower Directory</span>
          <div class="stat-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
        </div>
        <div class="stat-value" style="color: #A78BFA;">${state.borrowers.length}</div>
        <div class="stat-sub">15 Pre-seeded active profiles</div>
      </div>
    </div>

    <!-- Delinquency Alert Banner (if any) -->
    ${overdueLoans.length > 0 ? `
    <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.85rem;">
        <span style="font-size: 1.5rem;">🚨</span>
        <div>
          <div style="font-weight: 700; color: #F87171; font-size: 0.95rem;">
            ${overdueLoans.length} Loans Require Immediate Recovery Attention
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            Total overdue principal & charges: <strong style="color: #FFF;">${curr(overdueOutstanding)}</strong>. Send 1-click WhatsApp payment reminders now.
          </div>
        </div>
      </div>
      <button class="btn btn-danger btn-sm" id="dash-btn-overdue-desk">
        Open Collections Desk
      </button>
    </div>` : ''}

    <!-- Main Two-Column Section -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
      
      <!-- Upcoming Due Collections -->
      <div class="card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.05rem; font-weight: 700;">Installments Due Soon</h3>
          <span class="badge badge-pending">Upcoming</span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Due Date</th>
                <th>Borrower</th>
                <th>Amount Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${upcomingInstallments.map(inst => {
                const loan = state.loans.find(l => l.id === inst.loan_id);
                const isLate = inst.due_date < todayStr;
                return `
                  <tr>
                    <td class="font-mono" style="font-weight: 600; color: ${isLate ? '#F87171' : 'var(--text-main)'};">
                      ${inst.due_date}
                    </td>
                    <td style="font-weight: 600;">
                      ${loan ? loan.borrower_name : 'Borrower'}
                      <div style="font-size: 0.725rem; color: var(--text-dim);">${loan?.loan_number || ''}</div>
                    </td>
                    <td class="font-mono" style="font-weight: 700;">
                      ${curr(inst.total_due - (inst.amount_paid || 0))}
                    </td>
                    <td>
                      <span class="badge badge-${inst.status}">${inst.status}</span>
                    </td>
                    <td>
                      <button class="btn btn-secondary btn-sm record-pay-direct-btn" data-loan-id="${inst.loan_id}" data-amount="${inst.total_due - (inst.amount_paid || 0)}">
                        Pay
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Payments & Auditable Receipts -->
      <div class="card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.05rem; font-weight: 700;">Recent Payment Ledger</h3>
          <span class="badge badge-paid">Verified</span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Officer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${recentPayments.map(p => `
                <tr style="${p.is_reversal ? 'opacity: 0.6; text-decoration: line-through;' : ''}">
                  <td class="font-mono" style="font-weight: 700; color: #60A5FA;">
                    ${p.receipt_number || p.id}
                  </td>
                  <td>${p.date}</td>
                  <td class="font-mono" style="font-weight: 700; color: ${p.amount < 0 ? '#F87171' : '#34D399'};">
                    ${curr(p.amount)}
                  </td>
                  <td style="text-transform: capitalize; font-size: 0.75rem;">
                    ${(p.method || 'cash').replace('_', ' ')}
                  </td>
                  <td style="font-size: 0.75rem; color: var(--text-muted);">${p.received_by || 'Staff'}</td>
                  <td>
                    <button class="btn btn-secondary btn-sm print-payment-receipt-btn" data-payment-id="${p.id}">
                      Receipt
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Quick Operations Launcher -->
    <div class="card" style="background: rgba(19, 29, 49, 0.5);">
      <h3 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);">
        Quick Workflows
      </h3>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button class="btn btn-primary" id="dash-btn-new-loan">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Originate New Loan (Live Preview)
        </button>
        <button class="btn btn-secondary" id="dash-btn-record-payment">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          Record Cash / Bank Payment
        </button>
        <button class="btn btn-whatsapp" id="dash-btn-whatsapp-desk">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.242-.038.375.281.144.346.491 1.2.534 1.288.043.088.072.19.014.305-.058.115-.087.188-.173.289l-.26.303c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
          Send WhatsApp Reminder
        </button>
        <button class="btn btn-secondary" id="dash-btn-import-csv">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Import Excel / CSV
        </button>
      </div>
    </div>
  `;

  // Attach dashboard listeners
  document.getElementById('dash-btn-overdue-desk')?.addEventListener('click', () => switchTab('overdue'));
  document.getElementById('dash-btn-new-loan')?.addEventListener('click', () => switchTab('new-loan'));
  document.getElementById('dash-btn-record-payment')?.addEventListener('click', () => openPaymentModal());
  document.getElementById('dash-btn-whatsapp-desk')?.addEventListener('click', () => switchTab('overdue'));
  document.getElementById('dash-btn-import-csv')?.addEventListener('click', () => switchTab('csv-importer'));

  container.querySelectorAll('.record-pay-direct-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openPaymentModal(btn.dataset.loanId, btn.dataset.amount);
    });
  });

  container.querySelectorAll('.print-payment-receipt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openReceiptModal(btn.dataset.paymentId);
    });
  });
}

/* ==========================================================================
   VIEW 2: BORROWERS
   ========================================================================== */
function renderBorrowers(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 800;">Borrower Directory</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Manage borrower credit profiles, guarantors, KYC and historical performance.</p>
      </div>
      <div style="display: flex; gap: 0.75rem;">
        <input type="text" id="borrower-search" class="form-input" placeholder="Search name, phone, town..." style="width: 260px;">
        <button class="btn btn-primary" id="btn-add-borrower-manual">+ Add Borrower</button>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table" id="borrowers-table">
        <thead>
          <tr>
            <th>Borrower Name</th>
            <th>ID / Phone</th>
            <th>Location & District</th>
            <th>Employment</th>
            <th>Active Loan</th>
            <th>Credit Standing</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="borrowers-tbody">
          <!-- Rendered dynamically -->
        </tbody>
      </table>
    </div>
  `;

  function renderTableRows(filter = '') {
    const tbody = document.getElementById('borrowers-tbody');
    if (!tbody) return;

    const filtered = state.borrowers.filter(b => {
      const q = filter.toLowerCase();
      return b.name.toLowerCase().includes(q) ||
             (b.phone && b.phone.includes(q)) ||
             (b.address && b.address.toLowerCase().includes(q)) ||
             (b.employer && b.employer.toLowerCase().includes(q));
    });

    tbody.innerHTML = filtered.map(b => {
      const borrowerLoans = state.loans.filter(l => l.borrower_id === b.id);
      const activeLoan = borrowerLoans.find(l => l.status !== 'paid_off');
      const cleanPhone = (b.phone || '').replace(/\D/g, '');

      return `
        <tr>
          <td>
            <div style="font-weight: 700; font-size: 0.95rem;">${b.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${b.id_number}</div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span>${b.phone}</span>
              <a href="https://wa.me/${cleanPhone.length === 7 ? '501' + cleanPhone : cleanPhone}" target="_blank" title="WhatsApp Chat" style="color: #25D366;">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.242-.038.375.281.144.346.491 1.2.534 1.288.043.088.072.19.014.305-.058.115-.087.188-.173.289l-.26.303c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
              </a>
            </div>
            <div style="font-size: 0.725rem; color: var(--text-muted);">${b.email || ''}</div>
          </td>
          <td>${b.address}</td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${b.employer}</td>
          <td>
            ${activeLoan ? `
              <div class="font-mono" style="font-weight: 700; color: ${activeLoan.status === 'overdue' ? '#F87171' : '#34D399'};">
                ${curr(activeLoan.total_outstanding)}
              </div>
              <div style="font-size: 0.725rem; color: var(--text-dim);">${activeLoan.loan_number}</div>
            ` : '<span style="color: var(--text-dim);">No active balance</span>'}
          </td>
          <td>
            <span class="badge badge-${b.rating === 'critical' || b.rating === 'risky' ? 'overdue' : 'active'}">
              ${b.rating || 'Good'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-secondary btn-sm view-borrower-profile-btn" data-borrower-id="${b.id}">
                Profile
              </button>
              ${activeLoan ? `
                <button class="btn btn-primary btn-sm view-borrower-ledger-btn" data-loan-id="${activeLoan.id}">
                  Ledger
                </button>
              ` : `
                <button class="btn btn-secondary btn-sm new-loan-for-borrower-btn" data-borrower-id="${b.id}">
                  + Loan
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row events
    tbody.querySelectorAll('.view-borrower-profile-btn').forEach(btn => {
      btn.addEventListener('click', () => openBorrowerProfile(btn.dataset.borrowerId));
    });
    tbody.querySelectorAll('.view-borrower-ledger-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedLoanId = btn.dataset.loanId;
        switchTab('loan-ledger');
      });
    });
    tbody.querySelectorAll('.new-loan-for-borrower-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab('new-loan');
        const sel = document.getElementById('nl-borrower-select');
        if (sel) sel.value = btn.dataset.borrowerId;
      });
    });
  }

  renderTableRows();

  document.getElementById('borrower-search')?.addEventListener('input', (e) => {
    renderTableRows(e.target.value);
  });

  document.getElementById('btn-add-borrower-manual')?.addEventListener('click', () => {
    const name = prompt('Enter Full Name of Borrower:');
    if (!name) return;
    const phone = prompt('Enter Phone Number (+501...):', '+501 ');
    const address = prompt('Enter Town / District:', 'Belize City');
    const employer = prompt('Enter Employer / Business:', 'Self-Employed');

    const newB = {
      id: `bor_${Date.now()}`,
      name,
      id_number: `BZ-${Math.floor(100000 + Math.random() * 900000)}-M`,
      phone: phone || '+501 600-0000',
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      address: address || 'Belize',
      employer: employer || 'General',
      guarantor: 'None recorded',
      notes: 'Manually created borrower profile',
      status: 'active',
      rating: 'good'
    };

    state.borrowers.unshift(newB);
    addAuditLog(state, {
      action: 'BORROWER_CREATED',
      user: currentUser,
      target: newB.name,
      details: `Created new borrower profile for ${newB.name}`
    });
    saveStoredData(state);
    showToast(`Borrower ${newB.name} added successfully!`);
    renderTableRows();
  });
}

function openBorrowerProfile(borrowerId) {
  const b = state.borrowers.find(x => x.id === borrowerId);
  if (!b) return;

  const bLoans = state.loans.filter(l => l.borrower_id === b.id);
  const modal = document.getElementById('modal-borrower-profile');
  const title = document.getElementById('bp-modal-title');
  const content = document.getElementById('bp-modal-content');

  title.textContent = `Borrower: ${b.name}`;

  content.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.85rem;">
      <div>
        <div style="color: var(--text-muted);">Social Security / ID:</div>
        <div style="font-weight: 700;">${b.id_number}</div>
      </div>
      <div>
        <div style="color: var(--text-muted);">Phone & WhatsApp:</div>
        <div style="font-weight: 700;">${b.phone}</div>
      </div>
      <div>
        <div style="color: var(--text-muted);">Residential Address:</div>
        <div style="font-weight: 700;">${b.address}</div>
      </div>
      <div>
        <div style="color: var(--text-muted);">Employer / Source of Income:</div>
        <div style="font-weight: 700;">${b.employer}</div>
      </div>
      <div>
        <div style="color: var(--text-muted);">Guarantor / Reference:</div>
        <div style="font-weight: 700;">${b.guarantor}</div>
      </div>
      <div>
        <div style="color: var(--text-muted);">Credit Standing:</div>
        <div><span class="badge badge-active">${b.rating || 'Good'}</span></div>
      </div>
    </div>

    <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem;">Loan History (${bLoans.length})</h4>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Loan Ref</th>
            <th>Principal</th>
            <th>Rate</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${bLoans.map(l => `
            <tr>
              <td class="font-mono" style="font-weight: 700;">${l.loan_number}</td>
              <td class="font-mono">${curr(l.principal)}</td>
              <td>${l.rate}% (${l.interest_method})</td>
              <td class="font-mono" style="font-weight: 700;">${curr(l.total_outstanding)}</td>
              <td><span class="badge badge-${l.status}">${l.status}</span></td>
              <td>
                <button class="btn btn-secondary btn-sm select-loan-from-modal-btn" data-loan-id="${l.id}">
                  Open Ledger
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
      <button class="btn btn-secondary" data-close="modal-borrower-profile">Close</button>
      <button class="btn btn-primary" id="bp-btn-create-loan" data-borrower-id="${b.id}">
        + Issue New Loan to ${b.name.split(' ')[0]}
      </button>
    </div>
  `;

  content.querySelectorAll('.select-loan-from-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('active');
      selectedLoanId = btn.dataset.loanId;
      switchTab('loan-ledger');
    });
  });

  document.getElementById('bp-btn-create-loan')?.addEventListener('click', (e) => {
    modal.classList.remove('active');
    switchTab('new-loan');
    const sel = document.getElementById('nl-borrower-select');
    if (sel) sel.value = e.target.dataset.borrowerId;
  });

  modal.classList.add('active');
}

/* ==========================================================================
   VIEW 3: NEW LOAN ORIGINATION WITH LIVE SCHEDULE PREVIEW
   ========================================================================== */
function renderNewLoan(container) {
  const todayStr = new Date().toISOString().split('T')[0];

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 800;">Originate New Loan</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem;">
          Configure principal, terms, and repayment frequency with an instant live schedule preview.
        </p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: minmax(360px, 460px) 1fr; gap: 2rem; align-items: start;">
      
      <!-- Parameters Form -->
      <div class="card">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1.25rem;">Loan Parameters</h3>
        
        <form id="form-new-loan">
          <div class="form-group">
            <label class="form-label">Borrower</label>
            <select id="nl-borrower-select" class="form-select" required>
              ${state.borrowers.map(b => `
                <option value="${b.id}">${b.name} (${b.phone})</option>
              `).join('')}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Principal Amount ($)</label>
              <input type="number" id="nl-principal" class="form-input font-mono" value="1500" step="50" min="100" required>
            </div>
            <div class="form-group">
              <label class="form-label">Annual / Flat Rate (%)</label>
              <input type="number" id="nl-rate" class="form-input font-mono" value="20" step="0.5" min="1" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Interest Calculation Method</label>
              <select id="nl-method" class="form-select">
                <option value="flat" selected>Flat Rate (Simple)</option>
                <option value="reducing">Reducing Balance (Amortized)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Repayment Frequency</label>
              <select id="nl-frequency" class="form-select">
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY" selected>Bi-weekly (Fortnightly)</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Number of Installments</label>
              <input type="number" id="nl-term" class="form-input font-mono" value="6" min="1" max="104" required>
            </div>
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input type="date" id="nl-start-date" class="form-input" value="${todayStr}" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Processing / Documentation Fee ($)</label>
            <input type="number" id="nl-fee" class="form-input font-mono" value="35" min="0" step="5">
          </div>

          <div class="form-group">
            <label class="form-label">Internal Loan Purpose / Collateral Notes</label>
            <textarea id="nl-notes" class="form-textarea" rows="2" placeholder="e.g. Vehicle title #9921 held, personal emergency, market inventory..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; font-size: 0.95rem;">
            Originate Loan & Generate Schedule
          </button>
        </form>
      </div>

      <!-- Live Schedule Preview Panel -->
      <div>
        <!-- Live Summary Bar -->
        <div class="card" style="margin-bottom: 1.25rem; border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05);">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; text-align: center;">
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Total Principal</div>
              <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: #FFF;" id="prev-total-principal">$ 0.00</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Total Interest</div>
              <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: #60A5FA;" id="prev-total-interest">$ 0.00</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Total Repayment</div>
              <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: #34D399;" id="prev-total-repayment">$ 0.00</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Per Installment</div>
              <div class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: #FBBF24;" id="prev-per-installment">$ 0.00</div>
            </div>
          </div>
        </div>

        <!-- Schedule Table -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.05rem; font-weight: 700;">Live Installment Schedule Preview</h3>
            <span class="badge badge-active" id="prev-freq-badge">Bi-weekly</span>
          </div>

          <div class="table-container" style="max-height: 480px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Due Date</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Total Due</th>
                  <th>Balance Remaining</th>
                </tr>
              </thead>
              <tbody id="prev-schedule-tbody">
                <!-- Live preview injected -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `;

  // Function to recalculate live preview
  function updateLivePreview() {
    const principal = parseFloat(document.getElementById('nl-principal').value) || 0;
    const annualRate = parseFloat(document.getElementById('nl-rate').value) || 0;
    const interestMethod = document.getElementById('nl-method').value;
    const frequency = document.getElementById('nl-frequency').value;
    const termCount = parseInt(document.getElementById('nl-term').value, 10) || 0;
    const startDate = document.getElementById('nl-start-date').value || todayStr;
    const processingFee = parseFloat(document.getElementById('nl-fee').value) || 0;

    const res = generateSchedule({
      principal,
      annualRate,
      interestMethod,
      termCount,
      frequency,
      startDate,
      processingFee
    });

    document.getElementById('prev-total-principal').textContent = curr(res.principal);
    document.getElementById('prev-total-interest').textContent = curr(res.totalInterest);
    document.getElementById('prev-total-repayment').textContent = curr(res.totalRepayment);
    document.getElementById('prev-per-installment').textContent = curr(res.installmentAmount);
    document.getElementById('prev-freq-badge').textContent = frequency;

    const tbody = document.getElementById('prev-schedule-tbody');
    tbody.innerHTML = res.schedule.map(inst => `
      <tr>
        <td class="font-mono" style="font-weight: 700;">#${inst.installment_number}</td>
        <td class="font-mono">${inst.due_date}</td>
        <td class="font-mono">${curr(inst.principal_due)}</td>
        <td class="font-mono" style="color: #60A5FA;">${curr(inst.interest_due)}</td>
        <td class="font-mono" style="font-weight: 700; color: #34D399;">${curr(inst.total_due)}</td>
        <td class="font-mono" style="color: var(--text-dim);">${curr(inst.remaining_balance)}</td>
      </tr>
    `).join('');

    return res;
  }

  // Attach live input listeners
  ['nl-principal', 'nl-rate', 'nl-method', 'nl-frequency', 'nl-term', 'nl-start-date', 'nl-fee'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateLivePreview);
    document.getElementById(id)?.addEventListener('change', updateLivePreview);
  });

  updateLivePreview();

  // Handle Form Submission
  document.getElementById('form-new-loan')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const borrowerId = document.getElementById('nl-borrower-select').value;
    const borrower = state.borrowers.find(b => b.id === borrowerId);
    if (!borrower) return;

    const principal = parseFloat(document.getElementById('nl-principal').value);
    const annualRate = parseFloat(document.getElementById('nl-rate').value);
    const interestMethod = document.getElementById('nl-method').value;
    const frequency = document.getElementById('nl-frequency').value;
    const termCount = parseInt(document.getElementById('nl-term').value, 10);
    const startDate = document.getElementById('nl-start-date').value;
    const processingFee = parseFloat(document.getElementById('nl-fee').value) || 0;
    const notes = document.getElementById('nl-notes').value;

    const scheduleRes = generateSchedule({
      principal,
      annualRate,
      interestMethod,
      termCount,
      frequency,
      startDate,
      processingFee
    });

    const newLoanId = `ln_${Date.now()}`;
    const loanNumber = `LN-2026-${100 + state.loans.length + 1}`;

    const newLoan = {
      id: newLoanId,
      loan_number: loanNumber,
      borrower_id: borrower.id,
      borrower_name: borrower.name,
      principal,
      rate: annualRate,
      interest_method: interestMethod,
      term_count: termCount,
      frequency,
      start_date: startDate,
      fees: processingFee,
      status: 'active',
      created_by: currentUser,
      notes: notes || 'New loan created via LendTrack'
    };

    const newInstallments = scheduleRes.schedule.map(inst => ({
      ...inst,
      id: `inst_${newLoanId}_${inst.installment_number}`,
      loan_id: newLoanId
    }));

    state.installments = state.installments.concat(newInstallments);

    const recomputed = recalculateLoanState(newLoan, state.installments, state.payments, state.charges);
    state.loans.unshift(recomputed.loan);

    addAuditLog(state, {
      action: 'LOAN_ORIGINATED',
      user: currentUser,
      target: `${loanNumber} (${borrower.name})`,
      details: `Originated ${curr(principal)} loan with ${termCount} ${frequency.toLowerCase()} installments at ${annualRate}% (${interestMethod})`
    });

    saveStoredData(state);
    showToast(`Loan ${loanNumber} originated for ${borrower.name}!`);

    selectedLoanId = newLoanId;
    switchTab('loan-ledger');
  });
}

/* ==========================================================================
   VIEW 4: LOAN LEDGER & DETAIL
   ========================================================================== */
function renderLoanLedger(container) {
  if (!selectedLoanId && state.loans.length > 0) {
    selectedLoanId = state.loans[0].id;
  }

  const loan = state.loans.find(l => l.id === selectedLoanId) || state.loans[0];
  if (!loan) {
    container.innerHTML = `<div class="card" style="text-align: center; padding: 3rem;">No loans found. Originate a loan first.</div>`;
    return;
  }

  const borrower = state.borrowers.find(b => b.id === loan.borrower_id) || { name: loan.borrower_name, phone: '' };
  const loanInstallments = state.installments
    .filter(i => i.loan_id === loan.id)
    .sort((a, b) => a.installment_number - b.installment_number);

  const loanPayments = state.payments
    .filter(p => p.loan_id === loan.id)
    .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));

  const loanCharges = state.charges.filter(c => c.loan_id === loan.id);

  const totalRepayment = loanInstallments.reduce((sum, i) => sum + (i.total_due || 0), 0);
  const totalPaid = loanInstallments.reduce((sum, i) => sum + (i.amount_paid || 0), 0);
  const percentPaid = totalRepayment > 0 ? Math.min(100, Math.round((totalPaid / totalRepayment) * 100)) : 0;

  container.innerHTML = `
    <!-- Top Selector & Actions -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div>
          <label style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 4px;">
            Select Loan Account:
          </label>
          <select id="ledger-loan-select" class="form-select" style="min-width: 320px; font-weight: 600;">
            ${state.loans.map(l => `
              <option value="${l.id}" ${l.id === loan.id ? 'selected' : ''}>
                ${l.loan_number} - ${l.borrower_name} (${curr(l.total_outstanding)} due) [${l.status.toUpperCase()}]
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-secondary" id="ledger-btn-statement">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print Statement
        </button>
        <button class="btn btn-primary" id="ledger-btn-pay">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          Record Payment
        </button>
      </div>
    </div>

    <!-- Loan Overview & Balance Cards -->
    <div class="card" style="margin-bottom: 1.5rem; padding: 1.75rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <h2 style="font-size: 1.5rem; font-weight: 800;">${loan.loan_number}</h2>
            <span class="badge badge-${loan.status}">${loan.status}</span>
          </div>
          <div style="font-size: 0.95rem; color: var(--text-muted); margin-top: 0.25rem;">
            Borrower: <strong style="color: #FFF;">${borrower.name}</strong> • ${borrower.phone} • ${borrower.address}
          </div>
        </div>

        <div style="text-align: right;">
          <div style="font-size: 0.775rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">Total Outstanding Balance</div>
          <div class="font-mono" style="font-size: 2rem; font-weight: 800; color: ${loan.status === 'overdue' ? '#F87171' : '#34D399'};">
            ${curr(loan.total_outstanding)}
          </div>
        </div>
      </div>

      <!-- Financial Metrics Breakdown -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; padding: 1rem 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Original Principal</div>
          <div class="font-mono" style="font-size: 1.1rem; font-weight: 700;">${curr(loan.principal)}</div>
        </div>
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Principal Remaining</div>
          <div class="font-mono" style="font-size: 1.1rem; font-weight: 700; color: #FFF;">${curr(loan.outstanding_principal)}</div>
        </div>
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Interest Rate & Method</div>
          <div style="font-size: 0.95rem; font-weight: 600;">${loan.rate}% (${loan.interest_method})</div>
        </div>
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Frequency & Terms</div>
          <div style="font-size: 0.95rem; font-weight: 600;">${loan.term_count} (${loan.frequency})</div>
        </div>
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Late Fees / Charges</div>
          <div class="font-mono" style="font-size: 1.1rem; font-weight: 700; color: ${loan.outstanding_charges > 0 ? '#F87171' : '#FFF'};">
            ${curr(loan.outstanding_charges)}
          </div>
        </div>
        <div>
          <div style="font-size: 0.725rem; color: var(--text-muted);">Total Paid To Date</div>
          <div class="font-mono" style="font-size: 1.1rem; font-weight: 700; color: #60A5FA;">${curr(totalPaid)}</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.775rem; margin-bottom: 0.35rem;">
          <span style="color: var(--text-muted);">Repayment Completion</span>
          <span style="font-weight: 700; color: #34D399;">${percentPaid}%</span>
        </div>
        <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.08); border-radius: 9999px; overflow: hidden;">
          <div style="width: ${percentPaid}%; height: 100%; background: linear-gradient(90deg, #10B981, #34D399); border-radius: 9999px; transition: width 0.3s ease;"></div>
        </div>
      </div>
    </div>

    <!-- Tabs for Installments vs Payments vs Charges -->
    <div style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 1rem;">Repayment Installments Schedule</h3>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Due Date</th>
              <th>Principal Due</th>
              <th>Interest Due</th>
              <th>Total Due</th>
              <th>Paid Amount</th>
              <th>Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${loanInstallments.map(inst => {
              const remaining = Math.max(0, inst.total_due - (inst.amount_paid || 0));
              return `
                <tr>
                  <td class="font-mono" style="font-weight: 700;">#${inst.installment_number}</td>
                  <td class="font-mono" style="font-weight: 600;">${inst.due_date}</td>
                  <td class="font-mono">${curr(inst.principal_due)}</td>
                  <td class="font-mono" style="color: #60A5FA;">${curr(inst.interest_due)}</td>
                  <td class="font-mono" style="font-weight: 700;">${curr(inst.total_due)}</td>
                  <td class="font-mono" style="color: #34D399;">${curr(inst.amount_paid || 0)}</td>
                  <td class="font-mono" style="font-weight: 700; color: ${remaining > 0 ? '#F87171' : 'var(--text-dim)'};">
                    ${curr(remaining)}
                  </td>
                  <td>
                    <span class="badge badge-${inst.status}">${inst.status}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payment Transactions Table (With Reversal Support) -->
    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.15rem; font-weight: 800;">Payment & Reversal History</h3>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Never deleted • Fully auditable</span>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Received By</th>
              <th>Notes / Audit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${loanPayments.length === 0 ? `
              <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No payments recorded yet.</td></tr>
            ` : loanPayments.map(p => `
              <tr style="${p.is_reversal ? 'opacity: 0.55; text-decoration: line-through;' : ''}">
                <td class="font-mono" style="font-weight: 700; color: #60A5FA;">
                  ${p.receipt_number || p.id}
                </td>
                <td>${p.date}</td>
                <td class="font-mono" style="font-weight: 700; color: ${p.amount < 0 ? '#F87171' : '#34D399'};">
                  ${curr(p.amount)}
                </td>
                <td style="text-transform: capitalize;">${(p.method || 'cash').replace('_', ' ')}</td>
                <td style="font-size: 0.8rem;">${p.received_by || 'Staff'}</td>
                <td style="font-size: 0.775rem; color: var(--text-muted); max-width: 250px;">
                  ${p.notes || '-'}
                </td>
                <td>
                  <div style="display: flex; gap: 0.4rem;">
                    ${!p.is_reversal ? `
                      <button class="btn btn-secondary btn-sm print-payment-receipt-btn" data-payment-id="${p.id}">
                        Receipt
                      </button>
                      <button class="btn btn-danger btn-sm reverse-payment-btn" data-payment-id="${p.id}" data-amount="${p.amount}">
                        Reverse
                      </button>
                    ` : '<span class="badge badge-overdue">Reversed</span>'}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach Ledger Listeners
  document.getElementById('ledger-loan-select')?.addEventListener('change', (e) => {
    selectedLoanId = e.target.value;
    renderLoanLedger(container);
  });

  document.getElementById('ledger-btn-pay')?.addEventListener('click', () => {
    openPaymentModal(loan.id);
  });

  document.getElementById('ledger-btn-statement')?.addEventListener('click', () => {
    window.print();
  });

  container.querySelectorAll('.print-payment-receipt-btn').forEach(btn => {
    btn.addEventListener('click', () => openReceiptModal(btn.dataset.paymentId));
  });

  container.querySelectorAll('.reverse-payment-btn').forEach(btn => {
    btn.addEventListener('click', () => openReversalModal(btn.dataset.paymentId));
  });
}

/* ==========================================================================
   VIEW 5: OVERDUE & WHATSAPP COLLECTIONS DESK
   ========================================================================== */
function renderOverdue(container) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Find all loans with overdue installments
  const overdueAccounts = [];

  state.loans.forEach(loan => {
    const installments = state.installments.filter(i => i.loan_id === loan.id);
    const overdueInsts = installments.filter(i => i.due_date < todayStr && i.status !== 'paid');

    if (overdueInsts.length > 0) {
      // Find oldest overdue date
      overdueInsts.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      const oldest = overdueInsts[0];
      const dueDate = new Date(oldest.due_date);
      const diffDays = Math.max(1, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));

      const totalOverdueAmount = overdueInsts.reduce((sum, i) => sum + (i.total_due - (i.amount_paid || 0)), 0);
      const borrower = state.borrowers.find(b => b.id === loan.borrower_id) || { name: loan.borrower_name, phone: '' };

      overdueAccounts.push({
        loan,
        borrower,
        oldestInstallment: { ...oldest, days_overdue: diffDays },
        daysOverdue: diffDays,
        overdueCount: overdueInsts.length,
        totalOverdueAmount
      });
    }
  });

  overdueAccounts.sort((a, b) => b.daysOverdue - a.daysOverdue);

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h2 style="font-size: 1.5rem; font-weight: 800;">Collections & WhatsApp Recovery Desk</h2>
          <span class="badge badge-overdue">${overdueAccounts.length} Delinquent</span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.85rem;">
          1-tap WhatsApp payment reminders with custom polite, urgent, or legal escalation notices.
        </p>
      </div>

      <div style="display: flex; gap: 0.5rem;" id="aging-filter-pills">
        <button class="btn btn-secondary btn-sm aging-pill active" data-bracket="all">All (${overdueAccounts.length})</button>
        <button class="btn btn-secondary btn-sm aging-pill" data-bracket="1-7">1–7 Days</button>
        <button class="btn btn-secondary btn-sm aging-pill" data-bracket="8-14">8–14 Days</button>
        <button class="btn btn-secondary btn-sm aging-pill" data-bracket="15-30">15–30 Days</button>
        <button class="btn btn-secondary btn-sm aging-pill" data-bracket="30+">30+ Days (PAR 30)</button>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Borrower</th>
            <th>Phone</th>
            <th>Loan Ref</th>
            <th>Days Late</th>
            <th>Overdue Amount</th>
            <th>Recommended Action</th>
            <th>Direct Recovery Action</th>
          </tr>
        </thead>
        <tbody id="overdue-tbody">
          <!-- Injected dynamically -->
        </tbody>
      </table>
    </div>
  `;

  function renderOverdueTable(filterBracket = 'all') {
    const tbody = document.getElementById('overdue-tbody');
    if (!tbody) return;

    const filtered = overdueAccounts.filter(acc => {
      if (filterBracket === '1-7') return acc.daysOverdue >= 1 && acc.daysOverdue <= 7;
      if (filterBracket === '8-14') return acc.daysOverdue >= 8 && acc.daysOverdue <= 14;
      if (filterBracket === '15-30') return acc.daysOverdue >= 15 && acc.daysOverdue <= 30;
      if (filterBracket === '30+') return acc.daysOverdue > 30;
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No accounts in this arrears bracket.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(acc => {
      const templateMsg = getReminderTemplate(acc.borrower, acc.loan, acc.oldestInstallment, state.organization);
      const waLink = createWhatsAppLink(acc.borrower.phone, templateMsg);

      let urgencyPill = '';
      if (acc.daysOverdue > 30) {
        urgencyPill = '<span class="badge badge-overdue">PAR 30+ (Legal Action)</span>';
      } else if (acc.daysOverdue > 14) {
        urgencyPill = '<span class="badge badge-overdue">Urgent Warning</span>';
      } else if (acc.daysOverdue > 7) {
        urgencyPill = '<span class="badge badge-pending">Second Notice</span>';
      } else {
        urgencyPill = '<span class="badge badge-pending">Gentle Reminder</span>';
      }

      return `
        <tr>
          <td>
            <div style="font-weight: 700; font-size: 0.95rem;">${acc.borrower.name}</div>
            <div style="font-size: 0.725rem; color: var(--text-dim);">${acc.borrower.address}</div>
          </td>
          <td class="font-mono">${acc.borrower.phone}</td>
          <td>
            <span class="font-mono" style="font-weight: 700; color: #60A5FA;">${acc.loan.loan_number}</span>
            <div style="font-size: 0.725rem; color: var(--text-muted);">${acc.overdueCount} installment(s) late</div>
          </td>
          <td>
            <span class="font-mono" style="font-weight: 800; font-size: 1rem; color: ${acc.daysOverdue > 30 ? '#F87171' : '#FBBF24'};">
              ${acc.daysOverdue} Days
            </span>
          </td>
          <td class="font-mono" style="font-weight: 800; font-size: 1rem; color: #F87171;">
            ${curr(acc.totalOverdueAmount)}
          </td>
          <td>${urgencyPill}</td>
          <td>
            <div style="display: flex; gap: 0.5rem;">
              <a href="${waLink}" target="_blank" class="btn btn-whatsapp btn-sm whatsapp-reminder-btn" data-borrower="${acc.borrower.name}" data-loan="${acc.loan.loan_number}">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.242-.038.375.281.144.346.491 1.2.534 1.288.043.088.072.19.014.305-.058.115-.087.188-.173.289l-.26.303c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
                WhatsApp Reminder
              </a>
              <button class="btn btn-secondary btn-sm overdue-pay-btn" data-loan-id="${acc.loan.id}" data-amount="${acc.totalOverdueAmount}">
                Collect
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Log reminder in audit on click
    tbody.querySelectorAll('.whatsapp-reminder-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addAuditLog(state, {
          action: 'WHATSAPP_REMINDER_SENT',
          user: currentUser,
          target: `${btn.dataset.borrower} (${btn.dataset.loan})`,
          details: `Sent automated collections WhatsApp message to ${btn.dataset.borrower}`
        });
        showToast(`Logged WhatsApp reminder to ${btn.dataset.borrower}`);
      });
    });

    tbody.querySelectorAll('.overdue-pay-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openPaymentModal(btn.dataset.loanId, btn.dataset.amount);
      });
    });
  }

  renderOverdueTable('all');

  document.querySelectorAll('.aging-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.aging-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderOverdueTable(pill.dataset.bracket);
    });
  });
}

/* ==========================================================================
   VIEW 6: REPORTS & PORTFOLIO AGING
   ========================================================================== */
function renderReports(container) {
  const activeLoans = state.loans.filter(l => l.status !== 'paid_off');
  const totalPrincipalOut = activeLoans.reduce((sum, l) => sum + (l.outstanding_principal || 0), 0);
  const totalInterestOut = activeLoans.reduce((sum, l) => sum + (l.outstanding_interest || 0), 0);
  const totalChargesOut = activeLoans.reduce((sum, l) => sum + (l.outstanding_charges || 0), 0);
  const totalPortfolio = totalPrincipalOut + totalInterestOut + totalChargesOut;

  // Aging brackets calculation
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  let currentBucket = 0;
  let b1to30 = 0;
  let b31to60 = 0;
  let b60plus = 0;

  activeLoans.forEach(loan => {
    const overdueInsts = state.installments.filter(i => i.loan_id === loan.id && i.due_date < todayStr && i.status !== 'paid');
    if (overdueInsts.length === 0) {
      currentBucket += (loan.total_outstanding || 0);
    } else {
      overdueInsts.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      const diffDays = Math.max(1, Math.floor((today - new Date(overdueInsts[0].due_date)) / (1000 * 60 * 60 * 24)));
      if (diffDays <= 30) {
        b1to30 += (loan.total_outstanding || 0);
      } else if (diffDays <= 60) {
        b31to60 += (loan.total_outstanding || 0);
      } else {
        b60plus += (loan.total_outstanding || 0);
      }
    }
  });

  // Collections by method
  const methodTotals = { cash: 0, bank_transfer: 0, mobile_digiwallet: 0, cheque: 0 };
  state.payments.filter(p => !p.reversed).forEach(p => {
    const m = p.method || 'cash';
    if (methodTotals[m] !== undefined) methodTotals[m] += (p.amount || 0);
    else methodTotals.cash += (p.amount || 0);
  });

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 800;">Portfolio Analytics & Aging Reports</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Standard microfinance aging analysis (PAR 30, PAR 60, PAR 90) and collections summary.</p>
      </div>
      <button class="btn btn-secondary" onclick="window.print()">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
        Print Report
      </button>
    </div>

    <!-- Portfolio Summary Metrics -->
    <div class="grid-cols-4" style="margin-bottom: 1.5rem;">
      <div class="card stat-card" style="--card-accent: #10B981;">
        <span class="stat-title">Total Active Portfolio</span>
        <div class="stat-value font-mono" style="color: #34D399;">${curr(totalPortfolio)}</div>
        <div class="stat-sub">Principal + Accrued Interest</div>
      </div>

      <div class="card stat-card" style="--card-accent: #3B82F6;">
        <span class="stat-title">Principal at Risk (PAR 30+)</span>
        <div class="stat-value font-mono" style="color: #60A5FA;">
          ${totalPortfolio > 0 ? ((b31to60 + b60plus) / totalPortfolio * 100).toFixed(1) : 0}%
        </div>
        <div class="stat-sub">${curr(b31to60 + b60plus)} delinquent >30 days</div>
      </div>

      <div class="card stat-card" style="--card-accent: #F59E0B;">
        <span class="stat-title">Uncollected Late Fees</span>
        <div class="stat-value font-mono" style="color: #FBBF24;">${curr(totalChargesOut)}</div>
        <div class="stat-sub">Recoverable penalty charges</div>
      </div>

      <div class="card stat-card" style="--card-accent: #8B5CF6;">
        <span class="stat-title">Total Lifetime Collections</span>
        <div class="stat-value font-mono" style="color: #A78BFA;">
          ${curr(state.payments.filter(p => !p.reversed).reduce((s, p) => s + (p.amount || 0), 0))}
        </div>
        <div class="stat-sub">${state.payments.length} verified receipts</div>
      </div>
    </div>

    <!-- Aging Schedule Table -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Portfolio Aging Distribution (PAR)</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Aging Category</th>
              <th>Status Definition</th>
              <th>Outstanding Balance</th>
              <th>% of Portfolio</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 700; color: #34D399;">Current & On-Time</td>
              <td>0 days past due date</td>
              <td class="font-mono" style="font-weight: 700;">${curr(currentBucket)}</td>
              <td class="font-mono">${totalPortfolio > 0 ? ((currentBucket / totalPortfolio) * 100).toFixed(1) : 0}%</td>
              <td><span class="badge badge-active">Normal</span></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #FBBF24;">Early Arrears (1–30 Days)</td>
              <td>Missed 1 payment cycle (Grace period applied)</td>
              <td class="font-mono" style="font-weight: 700;">${curr(b1to30)}</td>
              <td class="font-mono">${totalPortfolio > 0 ? ((b1to30 / totalPortfolio) * 100).toFixed(1) : 0}%</td>
              <td><span class="badge badge-pending">Watchlist</span></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #F87171;">Late Default (31–60 Days)</td>
              <td>Missed 2 payment cycles (PAR 30+)</td>
              <td class="font-mono" style="font-weight: 700;">${curr(b31to60)}</td>
              <td class="font-mono">${totalPortfolio > 0 ? ((b31to60 / totalPortfolio) * 100).toFixed(1) : 0}%</td>
              <td><span class="badge badge-overdue">Substandard</span></td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #DC2626;">Severe Arrears (60+ Days)</td>
              <td>PAR 60+ (Guarantor and Collateral Recovery)</td>
              <td class="font-mono" style="font-weight: 700;">${curr(b60plus)}</td>
              <td class="font-mono">${totalPortfolio > 0 ? ((b60plus / totalPortfolio) * 100).toFixed(1) : 0}%</td>
              <td><span class="badge badge-overdue" style="background: rgba(220, 38, 38, 0.3);">Doubtful</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Collections by Payment Method Breakdown -->
    <div class="card">
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Collections Inflow by Channel</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
        <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.775rem; color: var(--text-muted); text-transform: uppercase;">Cash at Branch</div>
          <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: #34D399; margin: 0.25rem 0;">${curr(methodTotals.cash)}</div>
          <div style="font-size: 0.75rem; color: var(--text-dim);">Counter receipts</div>
        </div>
        <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.775rem; color: var(--text-muted); text-transform: uppercase;">Bank Transfer / Direct Deposit</div>
          <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: #60A5FA; margin: 0.25rem 0;">${curr(methodTotals.bank_transfer)}</div>
          <div style="font-size: 0.75rem; color: var(--text-dim);">Belize Bank / Heritage / Atlantic</div>
        </div>
        <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.775rem; color: var(--text-muted); text-transform: uppercase;">DigiWallet / Mobile Pay</div>
          <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: #FBBF24; margin: 0.25rem 0;">${curr(methodTotals.mobile_digiwallet)}</div>
          <div style="font-size: 0.75rem; color: var(--text-dim);">Instant mobile collections</div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   VIEW 7: CSV IMPORTER & MIGRATION WIZARD
   ========================================================================== */
function renderCSVImporter(container) {
  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.5rem;">Excel / CSV Migration Wizard</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Eliminate the biggest barrier to switching. Paste or upload your current lending spreadsheet to automatically create borrowers and recalculate repayment schedules in seconds.
        </p>
      </div>

      <div class="card" style="margin-bottom: 1.5rem; padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.05rem; font-weight: 700;">Paste CSV Data or Load Template</h3>
          <button class="btn btn-secondary btn-sm" id="btn-load-sample-csv">
            Load Belize Lenders Sample CSV
          </button>
        </div>

        <div class="form-group">
          <textarea id="csv-paste-input" class="form-textarea font-mono" rows="8" placeholder="Paste your CSV with headers: Borrower Name, Phone, Address, Employer, Principal, Interest Rate, Interest Method, Term Count, Frequency, Start Date..."></textarea>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.75rem; color: var(--text-dim);">
            Columns supported: Name, Phone, Address, Principal, Rate, Term, Frequency, Method
          </span>
          <button class="btn btn-primary" id="btn-parse-csv">
            Validate & Preview Rows
          </button>
        </div>
      </div>

      <!-- Preview Container -->
      <div id="csv-preview-container" style="display: none;" class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 700;">Data Validation Preview</h3>
            <div style="font-size: 0.8rem; color: #34D399;" id="csv-preview-count">0 rows ready to import</div>
          </div>
          <button class="btn btn-primary" id="btn-execute-import">
            Import Into Live System
          </button>
        </div>

        <div class="table-container" style="max-height: 340px; overflow-y: auto;">
          <table class="data-table" id="csv-preview-table">
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Phone</th>
                <th>Principal</th>
                <th>Rate</th>
                <th>Method</th>
                <th>Term</th>
              </tr>
            </thead>
            <tbody id="csv-preview-tbody">
              <!-- Injected dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  let parsedRowsCache = [];

  document.getElementById('btn-load-sample-csv')?.addEventListener('click', () => {
    const input = document.getElementById('csv-paste-input');
    if (input) input.value = CSV_SAMPLE_TEMPLATE;
  });

  document.getElementById('btn-parse-csv')?.addEventListener('click', () => {
    const raw = document.getElementById('csv-paste-input')?.value || '';
    parsedRowsCache = parseCSV(raw);

    if (parsedRowsCache.length === 0) {
      showToast('Could not parse any rows. Check CSV format.', 'error');
      return;
    }

    const previewContainer = document.getElementById('csv-preview-container');
    const previewCount = document.getElementById('csv-preview-count');
    const tbody = document.getElementById('csv-preview-tbody');

    previewCount.textContent = `Found ${parsedRowsCache.length} valid loans ready for batch creation`;
    tbody.innerHTML = parsedRowsCache.map(r => `
      <tr>
        <td style="font-weight: 700;">${r['Borrower Name'] || r['name']}</td>
        <td class="font-mono">${r['Phone'] || r['phone']}</td>
        <td class="font-mono">${curr(r['Principal'] || r['principal'])}</td>
        <td>${r['Interest Rate'] || r['rate']}%</td>
        <td>${r['Interest Method'] || r['method']}</td>
        <td>${r['Term Count'] || r['term']} (${r['Frequency'] || r['frequency']})</td>
      </tr>
    `).join('');

    previewContainer.style.display = 'block';
    showToast(`Validated ${parsedRowsCache.length} rows successfully!`);
  });

  document.getElementById('btn-execute-import')?.addEventListener('click', () => {
    if (parsedRowsCache.length === 0) return;
    state = importRowsIntoSystem(parsedRowsCache, state);
    saveStoredData(state);
    showToast(`Batch import complete! Added ${parsedRowsCache.length} loans.`);
    switchTab('dashboard');
  });
}

/* ==========================================================================
   VIEW 8: AUDIT LOG (Lenders Care Deeply About This)
   ========================================================================== */
function renderAuditLog(container) {
  const logs = state.auditLogs || [];

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 800;">Immutable Audit Log</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem;">
          Cryptographic & operational change log. Records every origination, payment, reversal, and reminder.
        </p>
      </div>
      <button class="btn btn-secondary btn-sm" id="btn-export-audit">
        Export Audit JSON
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action Type</th>
            <th>Authorized User</th>
            <th>Target Account</th>
            <th>Transaction Details</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(log => `
            <tr>
              <td class="font-mono" style="font-size: 0.775rem; color: var(--text-muted);">
                ${log.timestamp ? log.timestamp.replace('T', ' ').substring(0, 19) : '-'}
              </td>
              <td>
                <span class="badge ${log.action.includes('REVERSAL') ? 'badge-overdue' : 'badge-active'}">
                  ${log.action}
                </span>
              </td>
              <td style="font-weight: 600;">${log.user || 'System'}</td>
              <td style="color: #60A5FA; font-weight: 600;">${log.target || '-'}</td>
              <td style="font-size: 0.825rem; color: var(--text-main);">${log.details}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btn-export-audit')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lendtrack-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Audit log exported successfully!');
  });
}

/* ==========================================================================
   MODAL CONTROLLERS & PAYMENT ENGINE
   ========================================================================== */
function openPaymentModal(preselectedLoanId = null, suggestedAmount = null) {
  const modal = document.getElementById('modal-payment');
  const loanSelect = document.getElementById('payment-loan-select');
  const amountInput = document.getElementById('payment-amount');
  const dateInput = document.getElementById('payment-date');
  const receivedByInput = document.getElementById('payment-received-by');

  if (!modal || !loanSelect) return;

  // Populate active loans
  loanSelect.innerHTML = state.loans
    .filter(l => l.status !== 'paid_off')
    .map(l => `
      <option value="${l.id}" ${l.id === (preselectedLoanId || selectedLoanId) ? 'selected' : ''}>
        ${l.loan_number} - ${l.borrower_name} (${curr(l.total_outstanding)} due)
      </option>
    `).join('');

  if (loanSelect.options.length === 0) {
    showToast('No active loans with outstanding balances found.', 'error');
    return;
  }

  dateInput.value = new Date().toISOString().split('T')[0];
  receivedByInput.value = currentUser;

  function refreshLoanSummary() {
    const loan = state.loans.find(l => l.id === loanSelect.value);
    if (!loan) return;

    const b = state.borrowers.find(x => x.id === loan.borrower_id);
    const insts = state.installments.filter(i => i.loan_id === loan.id && i.status !== 'paid');
    insts.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    const nextDue = insts[0];

    document.getElementById('pay-box-borrower').textContent = b ? b.name : loan.borrower_name;
    document.getElementById('pay-box-balance').textContent = curr(loan.total_outstanding);
    document.getElementById('pay-box-installment').textContent = nextDue ? curr(nextDue.total_due - (nextDue.amount_paid || 0)) : curr(0);

    if (suggestedAmount) {
      amountInput.value = suggestedAmount;
    } else if (nextDue) {
      amountInput.value = (nextDue.total_due - (nextDue.amount_paid || 0)).toFixed(2);
    }

    refreshWaterfallPreview();
  }

  function refreshWaterfallPreview() {
    const loan = state.loans.find(l => l.id === loanSelect.value);
    const amt = parseFloat(amountInput.value) || 0;
    const previewText = document.getElementById('waterfall-preview-text');

    if (!loan || amt <= 0) {
      previewText.innerHTML = `Enter an amount above to see the automatic allocation across fees, interest, and principal.`;
      return;
    }

    const loanInsts = state.installments.filter(i => i.loan_id === loan.id);
    const loanCharges = state.charges.filter(c => c.loan_id === loan.id);

    const alloc = allocatePayment(loan, loanInsts, loanCharges, amt);
    const b = alloc.allocation;

    previewText.innerHTML = `
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.25rem;">
        <div><strong>Late Charges:</strong> <span style="color: #F87171;">${curr(b.chargesPaid)}</span></div>
        <div><strong>Interest Paid:</strong> <span style="color: #60A5FA;">${curr(b.interestPaid)}</span></div>
        <div><strong>Principal Paid:</strong> <span style="color: #34D399;">${curr(b.principalPaid)}</span></div>
      </div>
      ${b.excessPrincipal > 0 ? `<div style="margin-top: 0.35rem; color: #FBBF24;">* Includes ${curr(b.excessPrincipal)} extra prepayment directly reducing principal balance.</div>` : ''}
    `;
  }

  loanSelect.onchange = refreshLoanSummary;
  amountInput.oninput = refreshWaterfallPreview;

  refreshLoanSummary();
  modal.classList.add('active');
}

// Payment Form Handler
document.getElementById('form-record-payment')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const loanId = document.getElementById('payment-loan-select').value;
  const loan = state.loans.find(l => l.id === loanId);
  const amount = parseFloat(document.getElementById('payment-amount').value);
  const date = document.getElementById('payment-date').value;
  const method = document.getElementById('payment-method').value;
  const receivedBy = document.getElementById('payment-received-by').value;
  const notes = document.getElementById('payment-notes').value;

  if (!loan || !amount || amount <= 0) {
    showToast('Please enter a valid payment amount.', 'error');
    return;
  }

  const receiptNumber = `RCP-BZ-${Math.floor(1000 + Math.random() * 9000)}`;
  const paymentId = `pay_${Date.now()}`;

  const newPayment = {
    id: paymentId,
    loan_id: loan.id,
    amount,
    date,
    method,
    received_by: receivedBy,
    receipt_number: receiptNumber,
    notes: notes || 'Counter receipt collection',
    timestamp: new Date().toISOString()
  };

  state.payments.unshift(newPayment);

  // Recalculate loan state
  const recomputed = recalculateLoanState(loan, state.installments, state.payments, state.charges);

  // Update in state
  const loanIdx = state.loans.findIndex(l => l.id === loan.id);
  if (loanIdx !== -1) state.loans[loanIdx] = recomputed.loan;

  // Replace installments for this loan
  state.installments = state.installments
    .filter(i => i.loan_id !== loan.id)
    .concat(recomputed.installments);

  addAuditLog(state, {
    action: 'PAYMENT_RECORDED',
    user: receivedBy,
    target: `${loan.loan_number} (${loan.borrower_name})`,
    details: `Recorded ${curr(amount)} payment via ${method}. Receipt: ${receiptNumber}`
  });

  saveStoredData(state);
  showToast(`Recorded payment of ${curr(amount)} (Receipt ${receiptNumber})!`);

  // Close payment modal
  document.getElementById('modal-payment')?.classList.remove('active');

  // Open thermal receipt modal
  openReceiptModal(paymentId);

  // Refresh active view
  switchTab(currentTab);
});

function openReceiptModal(paymentId) {
  const p = state.payments.find(x => x.id === paymentId);
  if (!p) return;

  const loan = state.loans.find(l => l.id === p.loan_id);
  const borrower = state.borrowers.find(b => b.id === loan?.borrower_id) || { name: loan?.borrower_name || 'Borrower' };

  // Calculate allocation breakdown for receipt
  const loanInsts = state.installments.filter(i => i.loan_id === loan.id);
  const loanCharges = state.charges.filter(c => c.loan_id === loan.id);
  const allocRes = allocatePayment(loan, loanInsts, loanCharges, p.amount);

  const receiptHTML = generateThermalReceiptHTML({
    organization: state.organization,
    payment: p,
    loan,
    borrower,
    allocationBreakdown: allocRes.allocation
  });

  const renderTarget = document.getElementById('receipt-render-target');
  if (renderTarget) renderTarget.innerHTML = receiptHTML;

  document.getElementById('modal-receipt')?.classList.add('active');
}

function openReversalModal(paymentId) {
  const payment = state.payments.find(p => p.id === paymentId);
  if (!payment) return;

  document.getElementById('reversal-payment-id').value = paymentId;
  document.getElementById('modal-reversal')?.classList.add('active');
}

document.getElementById('form-reversal')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const paymentId = document.getElementById('reversal-payment-id').value;
  const reason = document.getElementById('reversal-reason').value;
  const authorizer = document.getElementById('reversal-authorizer').value;

  const originalPayment = state.payments.find(p => p.id === paymentId);
  if (!originalPayment) return;

  // Mark original as reversed
  originalPayment.reversed = true;

  // Create reversal transaction
  const rev = createReversal(originalPayment, reason, authorizer);
  state.payments.unshift(rev);

  // Recalculate loan state
  const loan = state.loans.find(l => l.id === originalPayment.loan_id);
  if (loan) {
    const recomputed = recalculateLoanState(loan, state.installments, state.payments, state.charges);
    const lIdx = state.loans.findIndex(l => l.id === loan.id);
    if (lIdx !== -1) state.loans[lIdx] = recomputed.loan;

    state.installments = state.installments
      .filter(i => i.loan_id !== loan.id)
      .concat(recomputed.installments);
  }

  addAuditLog(state, {
    action: 'PAYMENT_REVERSAL',
    user: authorizer,
    target: `Payment ${originalPayment.receipt_number || originalPayment.id}`,
    details: `Reversed payment of ${curr(originalPayment.amount)}. Reason: ${reason}`
  });

  saveStoredData(state);
  showToast(`Reversed payment ${originalPayment.receipt_number}. Balances restored.`);

  document.getElementById('modal-reversal')?.classList.remove('active');
  switchTab(currentTab);
});

// Attach Landing Page listeners (Calculator & copy buttons)
function attachLandingPageListeners() {
  document.getElementById('landing-cta-demo')?.addEventListener('click', () => switchTab('dashboard'));

  const slider = document.getElementById('calc-borrowers-slider');
  const valDisplay = document.getElementById('calc-borrowers-val');
  const savingsDisplay = document.getElementById('calc-savings-display');

  if (slider && valDisplay && savingsDisplay) {
    slider.addEventListener('input', (e) => {
      const count = parseInt(e.target.value, 10);
      valDisplay.textContent = count;
      // Formula: roughly $10.80 BZD in missed late fees & recovery per active borrower/month
      const estimated = Math.round(count * 10.85);
      savingsDisplay.textContent = `$ ${estimated.toLocaleString('en-US', { minimumFractionDigits: 2 })} BZD`;
    });
  }

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.text;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.color = '#34D399';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.color = '';
        }, 2000);
        showToast('Outreach message copied to clipboard!');
      });
    });
  });
}

// Global Modal Dismissal Logic
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modalId = btn.dataset.close;
    document.getElementById(modalId)?.classList.remove('active');
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// App Header Controls
document.getElementById('currency-select')?.addEventListener('change', (e) => {
  const symbol = e.target.value.includes('USD') ? 'USD $' : '$';
  state.organization.currency = e.target.value;
  state.organization.currency_symbol = symbol;
  saveStoredData(state);
  showToast(`Currency set to ${e.target.value}`);
  switchTab(currentTab);
});

document.getElementById('user-role-select')?.addEventListener('change', (e) => {
  currentUser = e.target.value;
  showToast(`Switched user to ${currentUser}`);
});

document.getElementById('btn-quick-record-payment')?.addEventListener('click', () => openPaymentModal());
document.getElementById('btn-quick-new-loan')?.addEventListener('click', () => switchTab('new-loan'));
document.getElementById('btn-print-receipt')?.addEventListener('click', printReceipt);

document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all data back to the default Belize QuickLend demo state?')) {
    state = resetToSeedData();
    selectedLoanId = state.loans[0]?.id || null;
    showToast('Reset data back to original 15 Belizean demo borrowers.');
    switchTab('dashboard');
  }
});

// Tab Buttons Click Handlers
document.querySelectorAll('.nav-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Initialize App
switchTab('dashboard');
updateHeaderTicker();
console.log('LendTrack Loan Management Core initialized successfully.');
