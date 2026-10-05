/**
 * LendTrack - Marketing Landing Page & Sales Enablement View
 * Renders Part 2 (Landing Page Copy & Packages) and Part 3 (Outreach Scripts)
 */

export function renderLandingPageView() {
  return `
    <div class="landing-page-container" style="max-width: 1100px; margin: 0 auto; padding-top: 1rem;">
      <!-- Hero Section -->
      <section style="text-align: center; padding: 3rem 1rem 3.5rem 1rem; position: relative;">
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.4rem 1rem; border-radius: 9999px; margin-bottom: 1.5rem;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
          <span style="font-size: 0.775rem; font-weight: 700; color: #34D399; letter-spacing: 0.05em; text-transform: uppercase;">Built for Private Lenders & Micro-Agencies</span>
        </div>

        <h1 style="font-size: 2.85rem; font-weight: 800; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 1.25rem; color: #FFFFFF;">
          Know exactly <span style="background: linear-gradient(135deg, #34D399, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">who owes you what.</span>
        </h1>

        <p style="font-size: 1.15rem; color: #94A3B8; max-width: 720px; margin: 0 auto 2.25rem auto; line-height: 1.6;">
          Loan tracking software for credit unions, small lenders, and businesses that offer financing. Replace fragile spreadsheets and handwritten notebooks in a day.
        </p>

        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          <button class="btn btn-primary" id="landing-cta-demo" style="padding: 0.85rem 1.75rem; font-size: 0.95rem;">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Explore Live Interactive Demo
          </button>
          <a href="https://wa.me/5016208000?text=Hi%20Patrick%2C%20I%20saw%20LendTrack%20for%20private%20lenders.%20Can%20you%20show%20me%20the%20demo%3F" target="_blank" class="btn btn-whatsapp" style="padding: 0.85rem 1.75rem; font-size: 0.95rem;">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.101.005.242-.038.375.281.144.346.491 1.2.534 1.288.043.088.072.19.014.305-.058.115-.087.188-.173.289l-.26.303c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/></svg>
            Chat with Me on WhatsApp
          </a>
        </div>
      </section>

      <!-- Three Core Benefits Grid -->
      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 1.75rem; font-weight: 800; text-align: center; margin-bottom: 2rem;">Why Lenders Switch From Excel & Paper</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          <div class="card" style="padding: 1.75rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.15); color: #34D399; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;">Automatic Schedules</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">
              Enter a loan and get every installment, interest figure, and due date instantly. Supports flat rate and reducing balance with zero formula mistakes.
            </p>
          </div>

          <div class="card" style="padding: 1.75rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(239, 68, 68, 0.15); color: #F87171; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;">Late Payments Flagged</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">
              See who's overdue at a glance. Tap once to send personalized, polite or firm payment reminders directly over WhatsApp with exact balances.
            </p>
          </div>

          <div class="card" style="padding: 1.75rem;">
            <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(59, 130, 246, 0.15); color: #60A5FA; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;">Clean Auditable Records</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">
              Print instant 80mm thermal receipts or full borrower statements. Never delete payments—reverse them with a full audit log to stop disputes cold.
            </p>
          </div>
        </div>
      </section>

      <!-- Interactive Loss Prevention Calculator -->
      <section class="card" style="margin-bottom: 4rem; padding: 2.25rem; border-color: rgba(16, 185, 129, 0.3); background: linear-gradient(180deg, rgba(19, 29, 49, 0.9) 0%, rgba(11, 18, 32, 0.95) 100%);">
        <div style="display: flex; flex-direction: column; md:flex-row; gap: 2rem; align-items: center;">
          <div style="flex: 1;">
            <div class="badge badge-active" style="margin-bottom: 0.75rem;">ROI Estimator</div>
            <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">How Much Are Spreadsheet Errors Costing You?</h3>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem;">
              Small lenders typically lose $200–$800 BZD every month from missed late fees, miscalculated partial payments, and untracked aging arrears.
            </p>

            <div style="margin-bottom: 1.25rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.5rem;">
                <span style="color: var(--text-muted);">Active Borrowers Managed:</span>
                <span style="font-weight: 800; font-family: var(--font-mono); color: #34D399;" id="calc-borrowers-val">60</span>
              </div>
              <input type="range" id="calc-borrowers-slider" min="15" max="300" step="5" value="60" style="width: 100%; accent-color: #10B981; cursor: pointer;">
            </div>
          </div>

          <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem 2rem; text-align: center; min-width: 280px;">
            <div style="font-size: 0.775rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 0.35rem;">
              Estimated Monthly Savings
            </div>
            <div style="font-size: 2.25rem; font-weight: 800; color: #34D399; font-family: var(--font-mono); margin-bottom: 0.35rem;" id="calc-savings-display">
              $ 650.00 BZD
            </div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">
              From collected late charges & 12+ hours saved reconciliations
            </div>
          </div>
        </div>
      </section>

      <!-- 3-Step Migration Workflow -->
      <section style="margin-bottom: 4rem; text-align: center;">
        <h2 style="font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem;">How It Works</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2.5rem;">You don't need IT staff or tech skills. We handle the switch.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; text-align: left;">
          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 2rem; font-weight: 800; color: #10B981; font-family: var(--font-mono); margin-bottom: 0.5rem;">01</div>
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem;">Send Your Borrower List</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Send us your existing Excel sheet, notebook photos, or use our 1-click CSV import tool.
            </p>
          </div>

          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 2rem; font-weight: 800; color: #3B82F6; font-family: var(--font-mono); margin-bottom: 0.5rem;">02</div>
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem;">We Configure Your Rules</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              We set up your custom interest rates, flat/reducing methods, grace periods, and logo.
            </p>
          </div>

          <div class="card" style="padding: 1.5rem;">
            <div style="font-size: 2rem; font-weight: 800; color: #F59E0B; font-family: var(--font-mono); margin-bottom: 0.5rem;">03</div>
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem;">You Collect Within Days</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Your staff records payments, prints receipts, and tracks delinquencies with zero headaches.
            </p>
          </div>
        </div>
      </section>

      <!-- Packages & Pricing -->
      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 1.75rem; font-weight: 800; text-align: center; margin-bottom: 0.5rem;">Simple, Predictable Packages</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; text-align: center; margin-bottom: 2.5rem;">No surprise fees. No percentage of your loan capital.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; align-items: stretch;">
          <!-- Starter -->
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 2rem;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Starter</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem;">For single operators and independent lenders.</p>
              
              <div style="margin-bottom: 1.5rem;">
                <span style="font-size: 2.25rem; font-weight: 800; font-family: var(--font-mono);">$99</span>
                <span style="color: var(--text-muted); font-size: 0.85rem;">BZD / month</span>
                <div style="font-size: 0.775rem; color: var(--text-dim); margin-top: 2px;">+ $150 BZD one-time onboarding</div>
              </div>

              <ul style="list-style: none; font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.5rem;">
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 1 Loan Officer / User</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Up to 100 active loans</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Automatic repayment schedules</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Printable thermal/PDF receipts</li>
              </ul>
            </div>

            <a href="https://wa.me/5016208000?text=Hi%20Patrick%2C%20I'm%20interested%20in%20the%20Starter%20Package%20for%20LendTrack." target="_blank" class="btn btn-secondary" style="width: 100%;">
              Get Started with Starter
            </a>
          </div>

          <!-- Standard (Featured) -->
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 2rem; border-color: #10B981; box-shadow: 0 0 24px rgba(16, 185, 129, 0.2); position: relative;">
            <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #10B981; color: #042F1A; font-size: 0.7rem; font-weight: 800; padding: 2px 10px; border-radius: 9999px; text-transform: uppercase;">
              Most Popular
            </div>

            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Standard</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem;">For established lending offices & credit teams.</p>
              
              <div style="margin-bottom: 1.5rem;">
                <span style="font-size: 2.25rem; font-weight: 800; font-family: var(--font-mono); color: #34D399;">$199</span>
                <span style="color: var(--text-muted); font-size: 0.85rem;">BZD / month</span>
                <div style="font-size: 0.775rem; color: var(--text-dim); margin-top: 2px;">+ $250 BZD one-time onboarding & data migration</div>
              </div>

              <ul style="list-style: none; font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.5rem;">
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Up to 5 User accounts (Officers/Collectors)</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Unlimited active loans</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> 1-Click WhatsApp Reminders & Templates</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Complete Portfolio Aging Reports (PAR 30/60)</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Excel / CSV Data Migration included</li>
              </ul>
            </div>

            <a href="https://wa.me/5016208000?text=Hi%20Patrick%2C%20I'm%20interested%20in%20the%20Standard%20Package%20for%20LendTrack." target="_blank" class="btn btn-primary" style="width: 100%;">
              Choose Standard
            </a>
          </div>

          <!-- Custom -->
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 2rem;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Custom</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem;">Multi-branch agencies & credit unions.</p>
              
              <div style="margin-bottom: 1.5rem;">
                <span style="font-size: 2.25rem; font-weight: 800; font-family: var(--font-mono);">Quoted</span>
                <div style="font-size: 0.775rem; color: var(--text-dim); margin-top: 2px;">Tailored to branch network</div>
              </div>

              <ul style="list-style: none; font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.5rem;">
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Multiple branches & regional isolation</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Custom payment gateway / SMS integrations</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Borrower self-service balance portal</li>
                <li style="display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10B981"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Dedicated account manager & SLA</li>
              </ul>
            </div>

            <a href="https://wa.me/5016208000?text=Hi%20Patrick%2C%20I'd%20like%20a%20Custom%20Quote%20for%20our%20lending%20agency." target="_blank" class="btn btn-secondary" style="width: 100%;">
              Contact for Custom Quote
            </a>
          </div>
        </div>
      </section>

      <!-- Outreach Message Arsenal (Part 3) -->
      <section class="card" style="margin-bottom: 4rem; padding: 2rem; background: var(--bg-surface);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700;">Direct Outreach Arsenal (For WhatsApp & DMs)</h3>
            <p style="color: var(--text-muted); font-size: 0.825rem;">Use these tested outreach messages when contacting lending agencies in Belize.</p>
          </div>
          <span class="badge badge-active">Sales Enablement</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
          <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: 700; font-size: 0.825rem; color: #34D399;">Initial Outreach (Cold WhatsApp)</span>
              <button class="btn btn-sm btn-secondary copy-btn" data-text="Hi [Name], I build loan management software for lenders in Belize. If you're tracking loans in Excel or a notebook, it automatically builds repayment schedules, flags late payers, and prints receipts. I have a live demo with sample data. Can I show you in 10 minutes? No obligation.">
                Copy
              </button>
            </div>
            <p style="font-size: 0.85rem; color: #E2E8F0; line-height: 1.5; font-style: italic;">
              "Hi [Name], I build loan management software for lenders in Belize. If you're tracking loans in Excel or a notebook, it automatically builds repayment schedules, flags late payers, and prints receipts. I have a live demo with sample data. Can I show you in 10 minutes? No obligation."
            </p>
          </div>

          <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: 700; font-size: 0.825rem; color: #FBBF24;">Follow-Up Message (Day 2)</span>
              <button class="btn btn-sm btn-secondary copy-btn" data-text="Hi [Name], just following up. Most lenders I show this to say the overdue list alone saves them hours each week. Happy to do a quick call or send the demo link.">
                Copy
              </button>
            </div>
            <p style="font-size: 0.85rem; color: #E2E8F0; line-height: 1.5; font-style: italic;">
              "Hi [Name], just following up. Most lenders I show this to say the overdue list alone saves them hours each week. Happy to do a quick call or send the demo link."
            </p>
          </div>
        </div>
      </section>

      <!-- Footer Disclaimer -->
      <footer style="text-align: center; border-top: 1px solid var(--border-subtle); padding: 2rem 1rem 1rem 1rem; color: var(--text-dim); font-size: 0.8rem;">
        <p>This is a record-keeping and management tool for licensed or established lenders. We do not make or arrange loans.</p>
        <p style="margin-top: 0.5rem;">© 2026 LendTrack Financial Technologies. All rights reserved.</p>
      </footer>
    </div>
  `;
}
