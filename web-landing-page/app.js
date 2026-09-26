/**
 * AutoMileage Interactive Client Script
 * Handles real-time Tax Shield Calculator, Tinder Swipe Simulation, and Accordion UX
 */

document.addEventListener('DOMContentLoaded', () => {
  initTaxCalculator();
  initSwipeDemo();
  initFaqAccordion();
});

/* ==========================================================================
   1. Interactive 1099 Tax Shield & True Net Calculator
   ========================================================================== */
function initTaxCalculator() {
  const grossInput = document.getElementById('grossEarningsInput');
  const milesInput = document.getElementById('businessMilesInput');
  const expensesInput = document.getElementById('expensesInput');
  const taxSelect = document.getElementById('taxBracketSelect');

  const grossDisplay = document.getElementById('grossEarningsDisplay');
  const milesDisplay = document.getElementById('businessMilesDisplay');
  const expensesDisplay = document.getElementById('expensesDisplay');
  const taxDisplay = document.getElementById('taxBracketDisplay');

  const annualShieldEl = document.getElementById('annualCashShield');
  const weeklyMileageEl = document.getElementById('weeklyMileageDeduction');
  const weeklyTotalDeductEl = document.getElementById('weeklyTotalDeduction');
  const weeklyNetTaxableEl = document.getElementById('weeklyNetTaxable');
  const percentShieldedEl = document.getElementById('percentShielded');

  const IRS_STANDARD_RATE = 0.67; // 67 cents / mile

  function formatUSD(val) {
    return '$' + Number(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function recalculate() {
    const gross = parseFloat(grossInput.value) || 0;
    const miles = parseFloat(milesInput.value) || 0;
    const expenses = parseFloat(expensesInput.value) || 0;
    const taxRate = parseFloat(taxSelect.value) || 0.27;

    // Display updates
    grossDisplay.textContent = '$' + Math.round(gross).toLocaleString();
    milesDisplay.textContent = Math.round(miles).toLocaleString() + ' mi';
    expensesDisplay.textContent = '$' + Math.round(expenses).toLocaleString();
    taxDisplay.textContent = Math.round(taxRate * 100) + '%';

    // Core tax shield formulas
    const weeklyMileageDeduction = miles * IRS_STANDARD_RATE;
    const weeklyTotalDeduction = weeklyMileageDeduction + expenses;
    const weeklyCashShield = weeklyTotalDeduction * taxRate;
    const annualCashShield = weeklyCashShield * 52;
    
    const weeklyNetTaxable = Math.max(0, gross - weeklyTotalDeduction);
    const percentShielded = gross > 0 ? Math.min(100, (weeklyTotalDeduction / gross) * 100) : 0;

    // DOM Updates
    annualShieldEl.textContent = formatUSD(annualCashShield);
    weeklyMileageEl.textContent = formatUSD(weeklyMileageDeduction);
    weeklyTotalDeductEl.textContent = formatUSD(weeklyTotalDeduction);
    weeklyNetTaxableEl.textContent = formatUSD(weeklyNetTaxable);
    percentShieldedEl.textContent = percentShielded.toFixed(1) + '%';
  }

  [grossInput, milesInput, expensesInput, taxSelect].forEach(input => {
    input.addEventListener('input', recalculate);
  });

  recalculate();
}

/* ==========================================================================
   2. Interactive Tinder-Style Swipe Deck Simulator
   ========================================================================== */
function initSwipeDemo() {
  const demoCard = document.getElementById('demoTripCard');
  const emptyState = document.getElementById('deckEmptyState');
  const swipeRightBtn = document.getElementById('swipeRightBtn');
  const swipeLeftBtn = document.getElementById('swipeLeftBtn');
  const undoBtn = document.getElementById('undoSwipeBtn');
  const resetBtn = document.getElementById('resetDeckBtn');

  const cardDistance = document.getElementById('demoCardDistance');
  const cardDeduction = document.getElementById('demoCardDeduction');
  const cardStart = document.getElementById('demoCardStart');
  const cardEnd = document.getElementById('demoCardEnd');

  const totalDeductionsEl = document.getElementById('demoTotalDeductions');
  const totalMilesEl = document.getElementById('demoTotalMiles');

  const sampleDrives = [
    { start: 'Downtown Courier Hub', end: 'West Lake Delivery', miles: 6.4, rate: 0.67, time: '14 mins', waypoints: 18 },
    { start: 'Airport Terminal B', end: 'Tech Ridge Hotel', miles: 14.8, rate: 0.67, time: '28 mins', waypoints: 34 },
    { start: 'Whole Foods Market', end: 'Oak Hill Residence', miles: 4.2, rate: 0.67, time: '11 mins', waypoints: 12 }
  ];

  let currentIndex = 0;
  let accumulatedDeductions = 0;
  let accumulatedMiles = 0;
  const history = [];

  function updateCardView() {
    if (currentIndex >= sampleDrives.length) {
      demoCard.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    demoCard.style.display = 'block';
    emptyState.style.display = 'none';
    demoCard.className = 'swipe-card active-card';
    demoCard.style.transform = '';
    demoCard.style.opacity = '1';

    const drive = sampleDrives[currentIndex];
    const deduction = (drive.miles * drive.rate).toFixed(2);
    cardDistance.textContent = drive.miles + ' mi';
    cardDeduction.textContent = '+$' + deduction;
    cardStart.textContent = drive.start;
    cardEnd.textContent = drive.end;
  }

  function updateTotalsDisplay() {
    totalDeductionsEl.textContent = '$' + accumulatedDeductions.toFixed(2);
    totalMilesEl.textContent = accumulatedMiles.toFixed(1) + ' mi';
  }

  function swipe(direction) {
    if (currentIndex >= sampleDrives.length) return;

    const drive = sampleDrives[currentIndex];
    const deduction = drive.miles * drive.rate;

    if (direction === 'business') {
      demoCard.classList.add('swiped-right');
      accumulatedDeductions += deduction;
      accumulatedMiles += drive.miles;
      history.push({ index: currentIndex, direction: 'business', deduction, miles: drive.miles });
    } else {
      demoCard.classList.add('swiped-left');
      history.push({ index: currentIndex, direction: 'personal', deduction: 0, miles: 0 });
    }

    updateTotalsDisplay();
    currentIndex++;

    setTimeout(() => {
      updateCardView();
    }, 320);
  }

  function undo() {
    if (history.length === 0) return;
    const last = history.pop();
    currentIndex = last.index;
    accumulatedDeductions = Math.max(0, accumulatedDeductions - last.deduction);
    accumulatedMiles = Math.max(0, accumulatedMiles - last.miles);
    updateTotalsDisplay();
    updateCardView();
  }

  function reset() {
    currentIndex = 0;
    accumulatedDeductions = 0;
    accumulatedMiles = 0;
    history.length = 0;
    updateTotalsDisplay();
    updateCardView();
  }

  // Pointer/Touch Drag gestures on the mock card
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  demoCard.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    isDragging = true;
    demoCard.style.transition = 'none';
    demoCard.setPointerCapture(e.pointerId);
  });

  demoCard.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    const rotate = currentX * 0.08;
    demoCard.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
  });

  const finishDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    demoCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

    if (currentX > 80) {
      swipe('business');
    } else if (currentX < -80) {
      swipe('personal');
    } else {
      demoCard.style.transform = '';
    }
    currentX = 0;
  };

  demoCard.addEventListener('pointerup', finishDrag);
  demoCard.addEventListener('pointercancel', finishDrag);

  swipeRightBtn.addEventListener('click', () => swipe('business'));
  swipeLeftBtn.addEventListener('click', () => swipe('personal'));
  undoBtn.addEventListener('click', undo);
  resetBtn.addEventListener('click', reset);

  // Initial populate
  updateCardView();
}

/* ==========================================================================
   3. FAQ Accordion Toggle
   ========================================================================== */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      const isActive = item.classList.contains('active');

      // Close all other items for clean accordion effect
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
