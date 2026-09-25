import { MileageEngine, EngineState, TripClassification, TaxCalculator } from './engine.js';
import { SAMPLE_ROUTES } from './routes.js';

// Sound effects using Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playChime(type) {
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'start') {
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === 'finish') {
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    }
  } catch (e) {
    // Audio context may require user interaction first
  }
}

// Instantiate core engine
const engine = new MileageEngine();

// UI Elements - Android App Phone
const statusLed = document.getElementById('status-led');
const batteryBanner = document.getElementById('battery-warning-banner');
const btnFixBattery = document.getElementById('btn-fix-battery');
const totalDeductionText = document.getElementById('total-deduction-text');
const totalMilesText = document.getElementById('total-miles-text');
const unclassifiedCountText = document.getElementById('unclassified-count-text');
const liveDriveCard = document.getElementById('live-drive-card');
const liveCarIcon = document.getElementById('live-car-icon');
const liveStatusTitle = document.getElementById('live-status-title');
const btnDriveAction = document.getElementById('btn-drive-action');
const liveMetricsRow = document.getElementById('live-metrics-row');
const liveDistance = document.getElementById('live-distance');
const liveDeduction = document.getElementById('live-deduction');
const liveWaypoints = document.getElementById('live-waypoints');
const tripsList = document.getElementById('trips-list');
const androidClock = document.getElementById('android-clock');

// Heads up notification
const headsUpNotif = document.getElementById('heads-up-notification');
const notifTitle = document.getElementById('notif-title');
const notifDesc = document.getElementById('notif-desc');
const notifBizBtn = document.getElementById('notif-biz-btn');
const notifPersBtn = document.getElementById('notif-pers-btn');
const notifClock = document.getElementById('notif-clock');
let pendingNotificationTripId = null;

// Telemetry & Hardware Console
const selectRoute = document.getElementById('select-route');
const selectSpeed = document.getElementById('select-speed');
const btnStartRoute = document.getElementById('btn-start-route');
const btnPauseRoute = document.getElementById('btn-pause-route');
const btnStopRoute = document.getElementById('btn-stop-route');
const routePlaybackStatus = document.getElementById('route-playback-status');
const mapTelemetryText = document.getElementById('map-telemetry-text');
const btnTriggerInVehicle = document.getElementById('btn-trigger-in-vehicle');
const btnTriggerStill = document.getElementById('btn-trigger-still');
const btnTriggerWalking = document.getElementById('btn-trigger-walking');
const btnToggleBatteryMode = document.getElementById('btn-toggle-battery-mode');
const oemBatteryText = document.getElementById('oem-battery-text');
const toggleGpsJitter = document.getElementById('toggle-gps-jitter');
const telemetryLogsContainer = document.getElementById('telemetry-logs');
const btnClearLogs = document.getElementById('btn-clear-logs');

// Header & Modal Actions
const btnResetData = document.getElementById('btn-reset-data');
const btnExportCsv = document.getElementById('btn-export-csv');
const btnViewTaxSummary = document.getElementById('btn-view-tax-summary');
const modalTaxSummary = document.getElementById('modal-tax-summary');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnModalClose = document.getElementById('btn-modal-close');
const btnModalDownloadCsv = document.getElementById('btn-modal-download-csv');
const modalBizMiles = document.getElementById('modal-biz-miles');
const modalBizDeduction = document.getElementById('modal-biz-deduction');
const modalPersMiles = document.getElementById('modal-pers-miles');
const modalPendingCount = document.getElementById('modal-pending-count');

// Setup Leaflet Map
let map;
let routePolyline;
let jitterMarkers = [];
let carMarker;
let isMapInitialized = false;

function initMap() {
  if (isMapInitialized || typeof L === 'undefined') return;

  const defaultRoute = SAMPLE_ROUTES[0];
  const startPt = defaultRoute.points[0];

  map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([startPt.lat, startPt.lng], 13);

  // Dark basemap tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  // Route path polyline
  routePolyline = L.polyline([], {
    color: '#10B981',
    weight: 5,
    opacity: 0.85,
    lineJoin: 'round'
  }).addTo(map);

  // Custom Car Marker Icon
  const carIcon = L.divIcon({
    className: 'custom-car-icon',
    html: `<div style="background:#10B981; color:#0B132B; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 14px rgba(16,185,129,0.8); border:2px solid #fff;"><span class="material-symbols-rounded" style="font-size:18px;">directions_car</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  carMarker = L.marker([startPt.lat, startPt.lng], { icon: carIcon }).addTo(map);
  isMapInitialized = true;
}

// Route Playback Simulator Variables
let currentRouteObj = SAMPLE_ROUTES[0];
let currentPointIndex = 0;
let routePlaybackTimer = null;
let isPaused = false;

function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (androidClock) androidClock.textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// Render UI based on Engine State
function renderUI({ stats, aggregates, settings }) {
  // 1. Top Bar status & LED
  const isRecording = stats.state === EngineState.RECORDING_DRIVE;
  const isCooldown = stats.state === EngineState.DWELLING_COOLDOWN;

  if (isRecording) {
    statusLed.classList.add('recording');
  } else {
    statusLed.classList.remove('recording');
  }

  // 2. Battery Optimization Warning
  if (settings.isIgnoringBattery) {
    batteryBanner.style.display = 'none';
    oemBatteryText.textContent = "Whitelisted";
    oemBatteryText.style.color = "var(--emerald)";
  } else {
    batteryBanner.style.display = 'flex';
    oemBatteryText.textContent = "Restricted";
    oemBatteryText.style.color = "var(--amber)";
  }

  // 3. ROI Card
  totalDeductionText.textContent = TaxCalculator.formatCurrency(aggregates.totalDeductions);
  totalMilesText.textContent = TaxCalculator.formatMiles(aggregates.totalMiles);
  unclassifiedCountText.textContent = `${aggregates.unclassifiedCount} drives`;
  unclassifiedCountText.className = aggregates.unclassifiedCount > 0 ? "stat-value pending" : "stat-value";

  // 4. Live Drive Card
  liveDriveCard.className = "live-drive-card";
  if (isRecording) {
    liveDriveCard.classList.add('recording');
    liveCarIcon.textContent = "directions_car";
    liveStatusTitle.textContent = "RECORDING DRIVE IN PROGRESS";
    btnDriveAction.textContent = "Stop";
    btnDriveAction.className = "btn-drive-action stop";
    liveMetricsRow.style.display = "grid";

    liveDistance.textContent = TaxCalculator.formatMiles(stats.distanceMiles);
    liveDeduction.textContent = TaxCalculator.formatCurrency(stats.deductionAmount);
    liveWaypoints.textContent = stats.waypointCount;
  } else if (isCooldown) {
    liveDriveCard.classList.add('cooldown');
    liveCarIcon.textContent = "local_parking";
    liveStatusTitle.textContent = `DWELLING COOLDOWN (${stats.dwellingSecondsLeft}s)`;
    btnDriveAction.textContent = "Stop Now";
    btnDriveAction.className = "btn-drive-action stop";
    liveMetricsRow.style.display = "grid";

    liveDistance.textContent = TaxCalculator.formatMiles(stats.distanceMiles);
    liveDeduction.textContent = TaxCalculator.formatCurrency(stats.deductionAmount);
    liveWaypoints.textContent = stats.waypointCount;
  } else {
    liveCarIcon.textContent = "sensors";
    liveStatusTitle.textContent = "AUTO-DETECTION STANDBY";
    btnDriveAction.textContent = "Simulate Drive";
    btnDriveAction.className = "btn-drive-action";
    liveMetricsRow.style.display = "none";
  }

  // 5. Recent Trips List
  renderTripsList(aggregates.allTrips);
}

function renderTripsList(trips) {
  if (!trips || trips.length === 0) {
    tripsList.innerHTML = `
      <div class="empty-trips-card">
        No drives recorded yet.<br>
        Start your vehicle or tap 'Simulate Drive' to test.
      </div>
    `;
    return;
  }

  tripsList.innerHTML = trips.map(trip => {
    const date = new Date(trip.startTimestamp);
    const dateFormatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }) + ' • ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const isBiz = trip.classification === TripClassification.BUSINESS;
    const isPers = trip.classification === TripClassification.PERSONAL;

    return `
      <div class="trip-card" data-id="${trip.id}">
        <div class="trip-card-header">
          <div>
            <div class="trip-date">${dateFormatted}</div>
            <div class="trip-miles">${TaxCalculator.formatMiles(trip.distanceMiles)}</div>
          </div>
          <div class="trip-deduction-badge">+${TaxCalculator.formatCurrency(trip.deductionAmount)}</div>
        </div>

        <div class="trip-actions-row">
          <button class="btn-classify biz ${isBiz ? 'selected' : ''}" data-action="classify" data-type="BUSINESS" data-id="${trip.id}">
            <span class="material-symbols-rounded" style="font-size: 16px;">work</span>
            Business ($)
          </button>
          <button class="btn-classify pers ${isPers ? 'selected' : ''}" data-action="classify" data-type="PERSONAL" data-id="${trip.id}">
            <span class="material-symbols-rounded" style="font-size: 16px;">person</span>
            Personal
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Heads up push notification handling
function showHeadsUpNotification(trip) {
  pendingNotificationTripId = trip.id;
  notifTitle.textContent = `Trip Completed: ${TaxCalculator.formatMiles(trip.distanceMiles)}`;
  notifDesc.textContent = `Estimated deduction: ${TaxCalculator.formatCurrency(trip.deductionAmount)}. Tap to classify.`;
  notifClock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  headsUpNotif.classList.add('visible');
  playChime('finish');

  // Auto-hide after 8 seconds if ignored
  setTimeout(() => {
    if (pendingNotificationTripId === trip.id) {
      headsUpNotif.classList.remove('visible');
    }
  }, 8000);
}

notifBizBtn.addEventListener('click', () => {
  if (pendingNotificationTripId) {
    engine.classifyTrip(pendingNotificationTripId, TripClassification.BUSINESS);
    headsUpNotif.classList.remove('visible');
    pendingNotificationTripId = null;
  }
});

notifPersBtn.addEventListener('click', () => {
  if (pendingNotificationTripId) {
    engine.classifyTrip(pendingNotificationTripId, TripClassification.PERSONAL);
    headsUpNotif.classList.remove('visible');
    pendingNotificationTripId = null;
  }
});

// Trip card classification delegation
tripsList.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="classify"]');
  if (!btn) return;
  const tripId = btn.dataset.id;
  const classification = btn.dataset.type;
  engine.classifyTrip(tripId, classification);
});

// Start/Stop button on the phone UI
btnDriveAction.addEventListener('click', () => {
  const stats = engine.getLiveStats();
  if (stats.state === EngineState.RECORDING_DRIVE || stats.state === EngineState.DWELLING_COOLDOWN) {
    const finishedTrip = engine.finalizeTripNow("MANUAL_STOP");
    if (finishedTrip) {
      showHeadsUpNotification(finishedTrip);
    }
    stopRouteSimulation();
  } else {
    engine.startRecording("MANUAL_UI");
    playChime('start');
    startRouteSimulation();
  }
});

// Battery Banner Fix button
btnFixBattery.addEventListener('click', () => {
  engine.toggleBatteryOptimization(true);
});

// Telemetry Log Feed
engine.subscribeLogs((log) => {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `
    <span class="log-time">[${log.timestamp}]</span>
    <span class="log-tag ${log.category}">[${log.category}]</span>
    <span class="log-msg">${log.message}</span>
  `;
  telemetryLogsContainer.appendChild(entry);
  telemetryLogsContainer.scrollTop = telemetryLogsContainer.scrollHeight;
});

btnClearLogs.addEventListener('click', () => {
  telemetryLogsContainer.innerHTML = '';
});

// Hardware Sensors / Activity Recognition Trigger Buttons
btnTriggerInVehicle.addEventListener('click', () => {
  engine.log("ACTIVITY", "ActivityTransitionManager: Detected IN_VEHICLE (Confidence 98%)");
  btnTriggerInVehicle.classList.add('active');
  setTimeout(() => btnTriggerInVehicle.classList.remove('active'), 1000);

  if (engine.state === EngineState.IDLE_STANDBY) {
    engine.startRecording("ACTIVITY_IN_VEHICLE");
    playChime('start');
    startRouteSimulation();
  }
});

btnTriggerStill.addEventListener('click', () => {
  engine.log("ACTIVITY", "ActivityTransitionManager: Detected STILL / PARKED (Confidence 95%)");
  btnTriggerStill.classList.add('active');
  setTimeout(() => btnTriggerStill.classList.remove('active'), 1000);

  if (engine.state === EngineState.RECORDING_DRIVE) {
    pauseRouteSimulation();
    engine.triggerVehicleStopped();
  }
});

btnTriggerWalking.addEventListener('click', () => {
  engine.log("ACTIVITY", "ActivityTransitionManager: Detected ON_FOOT / WALKING (Driver exited vehicle)");
  btnTriggerWalking.classList.add('active');
  setTimeout(() => btnTriggerWalking.classList.remove('active'), 1000);

  if (engine.state === EngineState.RECORDING_DRIVE) {
    pauseRouteSimulation();
    engine.triggerVehicleStopped();
  }
});

btnToggleBatteryMode.addEventListener('click', () => {
  engine.toggleBatteryOptimization(!engine.settings.isIgnoringBattery);
});

// Route Simulator Controls & Playback
selectRoute.addEventListener('change', () => {
  const routeId = selectRoute.value;
  currentRouteObj = SAMPLE_ROUTES.find(r => r.id === routeId) || SAMPLE_ROUTES[0];
  resetRouteSimulation();
});

function resetRouteSimulation() {
  stopRouteSimulation();
  currentPointIndex = 0;
  if (routePolyline) routePolyline.setLatLngs([]);
  jitterMarkers.forEach(m => map.removeLayer(m));
  jitterMarkers = [];

  const startPt = currentRouteObj.points[0];
  if (carMarker && map) {
    carMarker.setLatLng([startPt.lat, startPt.lng]);
    map.setView([startPt.lat, startPt.lng], 13);
  }
  routePlaybackStatus.textContent = "STANDBY";
  routePlaybackStatus.style.background = "#1e293b";
  routePlaybackStatus.style.color = "#94a3b8";
}

function startRouteSimulation() {
  if (routePlaybackTimer) return;
  isPaused = false;
  routePlaybackStatus.textContent = "DRIVING";
  routePlaybackStatus.style.background = "var(--emerald-subtle)";
  routePlaybackStatus.style.color = "var(--emerald)";

  const speedMultiplier = parseInt(selectSpeed.value, 10) || 5;
  const intervalMs = Math.max(400, Math.floor(3000 / speedMultiplier));

  routePlaybackTimer = setInterval(() => {
    stepRouteSimulation();
  }, intervalMs);
}

function pauseRouteSimulation() {
  if (routePlaybackTimer) {
    clearInterval(routePlaybackTimer);
    routePlaybackTimer = null;
  }
  isPaused = true;
  routePlaybackStatus.textContent = "PAUSED / PARKED";
  routePlaybackStatus.style.background = "#3B2A1A";
  routePlaybackStatus.style.color = "var(--amber)";
}

function stopRouteSimulation() {
  if (routePlaybackTimer) {
    clearInterval(routePlaybackTimer);
    routePlaybackTimer = null;
  }
  isPaused = false;
  routePlaybackStatus.textContent = "STOPPED";
  routePlaybackStatus.style.background = "#1e293b";
  routePlaybackStatus.style.color = "#94a3b8";
}

function stepRouteSimulation() {
  if (currentPointIndex >= currentRouteObj.points.length) {
    // Route complete: trigger parked / dwell cooldown
    stopRouteSimulation();
    engine.triggerVehicleStopped();
    return;
  }

  const basePoint = currentRouteObj.points[currentPointIndex];
  currentPointIndex += 1;

  // Check if red-light jitter simulation is active
  const injectJitter = toggleGpsJitter.checked;

  let candidateLat = basePoint.lat;
  let candidateLng = basePoint.lng;
  let candidateAccuracy = 8.5; // Good GPS fix (<25m)
  let candidateSpeed = basePoint.speedMps;

  if (injectJitter) {
    // Inject stationary drift or low accuracy fix
    const isDrift = Math.random() > 0.5;
    if (isDrift) {
      // Accuracy violation (>25m)
      candidateAccuracy = 35.0 + Math.random() * 20;
    } else {
      // Micro stationary movement (<0.5m/s)
      candidateLat += (Math.random() - 0.5) * 0.0001;
      candidateLng += (Math.random() - 0.5) * 0.0001;
      candidateSpeed = 0.2;
    }
  }

  const locationFix = {
    lat: candidateLat,
    lng: candidateLng,
    accuracy: candidateAccuracy,
    speed: candidateSpeed,
    time: Date.now()
  };

  const evalResult = engine.pushLocation(locationFix);

  // Update map visualizer
  if (map && carMarker) {
    carMarker.setLatLng([candidateLat, candidateLng]);
    map.panTo([candidateLat, candidateLng], { animate: true });

    if (evalResult.accepted) {
      routePolyline.addLatLng([candidateLat, candidateLng]);
      mapTelemetryText.textContent = `GPS Fix: ${candidateLat.toFixed(4)}, ${candidateLng.toFixed(4)} • Acc: ${candidateAccuracy.toFixed(1)}m`;
    } else {
      // Add a red jitter marker on the map to visualize discarded points
      const jitterMarker = L.circleMarker([candidateLat, candidateLng], {
        radius: 6,
        color: '#EF4444',
        fillColor: '#EF4444',
        fillOpacity: 0.6
      }).addTo(map);
      jitterMarkers.push(jitterMarker);
      mapTelemetryText.textContent = `Jitter Discarded • ${evalResult.reason}`;
    }
  }

  if (basePoint.pause && !injectJitter) {
    engine.log("ENGINE", `Simulation encountered stop / red light (${basePoint.label || 'Traffic stop'})`);
  }
}

// Route control buttons
btnStartRoute.addEventListener('click', () => {
  if (engine.state === EngineState.IDLE_STANDBY) {
    engine.startRecording("ROUTE_SIMULATOR");
    playChime('start');
  }
  startRouteSimulation();
});

btnPauseRoute.addEventListener('click', () => {
  pauseRouteSimulation();
  if (engine.state === EngineState.RECORDING_DRIVE) {
    engine.triggerVehicleStopped();
  }
});

btnStopRoute.addEventListener('click', () => {
  stopRouteSimulation();
  const finishedTrip = engine.finalizeTripNow("MANUAL_STOP");
  if (finishedTrip) {
    showHeadsUpNotification(finishedTrip);
  }
});

// CSV Export and Modal
function generateCsv(trips) {
  const headers = ["Trip ID", "Date", "Start Time", "End Time", "Miles", "IRS Rate", "Deduction ($)", "Classification", "Auto Detected"];
  const rows = trips.map(t => {
    const start = new Date(t.startTimestamp);
    const end = new Date(t.endTimestamp);
    return [
      t.id,
      start.toLocaleDateString(),
      start.toLocaleTimeString(),
      end.toLocaleTimeString(),
      t.distanceMiles,
      `$${t.deductionRate}`,
      `$${t.deductionAmount.toFixed(2)}`,
      t.classification,
      t.isAutoDetected ? 'YES' : 'NO'
    ].map(val => `"${val}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function downloadCsv() {
  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(generateCsv(engine.trips));
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", `IRS_Schedule_C_Mileage_${new Date().getFullYear()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  engine.log("SYSTEM", "Downloaded IRS Schedule C Mileage CSV report");
}

btnExportCsv.addEventListener('click', downloadCsv);
btnModalDownloadCsv.addEventListener('click', downloadCsv);

btnResetData.addEventListener('click', () => {
  if (confirm("Reset Room SQLite database and restore sample trips?")) {
    engine.resetAllData();
    resetRouteSimulation();
  }
});

// Modal open/close
btnViewTaxSummary.addEventListener('click', () => {
  const agg = engine.getAggregates();
  const personalTrips = engine.trips.filter(t => t.classification === TripClassification.PERSONAL);
  const personalMiles = personalTrips.reduce((acc, t) => acc + (t.distanceMiles || 0), 0);

  modalBizMiles.textContent = TaxCalculator.formatMiles(agg.totalMiles);
  modalBizDeduction.textContent = TaxCalculator.formatCurrency(agg.totalDeductions);
  modalPersMiles.textContent = TaxCalculator.formatMiles(personalMiles);
  modalPendingCount.textContent = `${agg.unclassifiedCount} trips`;

  modalTaxSummary.classList.add('open');
});

btnCloseModal.addEventListener('click', () => modalTaxSummary.classList.remove('open'));
btnModalClose.addEventListener('click', () => modalTaxSummary.classList.remove('open'));
modalTaxSummary.addEventListener('click', (e) => {
  if (e.target === modalTaxSummary) modalTaxSummary.classList.remove('open');
});

// Subscribe to engine
engine.subscribe(renderUI);

// Initialize Map once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  engine.log("SYSTEM", "Android Mileage Tracker test bench initialized successfully.");
  engine.log("SYSTEM", "Tracking Engine State: IDLE_STANDBY (Hardware activity sensors ready)");
});
