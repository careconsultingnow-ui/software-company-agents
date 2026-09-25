// Faithful port of TaxCalculator.kt, LocationFilter.kt, and LocationTrackingService.kt

export const IRS_RATE_2024 = 0.67;

export const TaxCalculator = {
  calculateDeduction(miles, rate = IRS_RATE_2024) {
    if (miles <= 0.0) return 0.0;
    return miles * rate;
  },

  metersToMiles(meters) {
    return meters * 0.000621371;
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  formatMiles(miles) {
    return `${Number(miles).toFixed(1)} mi`;
  }
};

export class LocationFilter {
  constructor(minAccuracyMeters = 25.0, minDisplacementMeters = 20.0) {
    this.minAccuracyMeters = minAccuracyMeters;
    this.minDisplacementMeters = minDisplacementMeters;
    this.lastValidLocation = null;
  }

  // Returns { accepted: boolean, reason?: string, distance?: number }
  evaluate(candidate) {
    // 1. Reject inaccurate fixes (accuracy > 25m)
    if (!candidate.accuracy || candidate.accuracy > this.minAccuracyMeters) {
      return {
        accepted: false,
        reason: `Poor GPS Accuracy (${candidate.accuracy ? candidate.accuracy.toFixed(1) : 'null'}m > ${this.minAccuracyMeters}m limit)`
      };
    }

    if (!this.lastValidLocation) {
      this.lastValidLocation = candidate;
      return { accepted: true, distance: 0 };
    }

    // 2. Reject out of order timestamps
    if (candidate.time <= this.lastValidLocation.time) {
      return { accepted: false, reason: "Timestamp out of chronological order" };
    }

    // 3. Compute distance (Haversine formula in meters)
    const distance = this.computeDistanceMeters(
      this.lastValidLocation.lat,
      this.lastValidLocation.lng,
      candidate.lat,
      candidate.lng
    );

    // 4. Red-light & stationary jitter check
    if (distance < this.minDisplacementMeters) {
      if (candidate.speed !== undefined && candidate.speed < 0.5) {
        return {
          accepted: false,
          reason: `Stationary Jitter Ignored (Displacement ${distance.toFixed(1)}m < 20m & speed ${candidate.speed.toFixed(1)} m/s)`
        };
      }
    }

    this.lastValidLocation = candidate;
    return { accepted: true, distance };
  }

  reset() {
    this.lastValidLocation = null;
  }

  computeDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const EngineState = {
  IDLE_STANDBY: "IDLE_STANDBY",
  MOTION_VERIFYING: "MOTION_VERIFYING",
  RECORDING_DRIVE: "RECORDING_DRIVE",
  DWELLING_COOLDOWN: "DWELLING_COOLDOWN"
};

export const TripClassification = {
  UNCLASSIFIED: "UNCLASSIFIED",
  BUSINESS: "BUSINESS",
  PERSONAL: "PERSONAL"
};

const DB_STORAGE_KEY = "MILEAGE_TRACKER_TRIPS_V1";
const SETTINGS_KEY = "MILEAGE_TRACKER_SETTINGS_V1";

export class MileageEngine {
  constructor() {
    this.state = EngineState.IDLE_STANDBY;
    this.currentTripId = null;
    this.tripStartTime = 0;
    this.accumulatedMeters = 0;
    this.lastLocation = null;
    this.activeWaypoints = [];
    this.filter = new LocationFilter(25.0, 20.0);
    this.listeners = new Set();
    this.logListeners = new Set();

    // Dwelling timer simulation (scaled down to 10 seconds for realistic interactive testing)
    this.dwellingSecondsLeft = 0;
    this.dwellingInterval = null;

    // Load persisted trips and settings
    this.trips = this.loadTripsFromStorage();
    this.settings = this.loadSettingsFromStorage();

    // Timer for live drive duration
    this.timerInterval = null;
    this.elapsedSeconds = 0;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    this.notify();
    return () => this.listeners.delete(listener);
  }

  subscribeLogs(listener) {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  log(category, message, details = null) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logItem = { timestamp, category, message, details };
    this.logListeners.forEach(listener => listener(logItem));
  }

  getLiveStats() {
    const distanceMiles = TaxCalculator.metersToMiles(this.accumulatedMeters);
    const deduction = TaxCalculator.calculateDeduction(distanceMiles);

    return {
      tripId: this.currentTripId,
      state: this.state,
      distanceMiles: distanceMiles,
      deductionAmount: deduction,
      currentSpeedMps: this.lastLocation?.speed || 0,
      durationSeconds: this.elapsedSeconds,
      waypointCount: this.activeWaypoints.length,
      dwellingSecondsLeft: this.dwellingSecondsLeft
    };
  }

  getAggregates() {
    const businessTrips = this.trips.filter(t => t.classification === TripClassification.BUSINESS);
    const unclassifiedTrips = this.trips.filter(t => t.classification === TripClassification.UNCLASSIFIED);

    const totalMiles = businessTrips.reduce((acc, t) => acc + (t.distanceMiles || 0), 0);
    const totalDeductions = businessTrips.reduce((acc, t) => acc + (t.deductionAmount || 0), 0);

    return {
      totalMiles,
      totalDeductions,
      unclassifiedCount: unclassifiedTrips.length,
      allTrips: [...this.trips].sort((a, b) => b.startTimestamp - a.startTimestamp)
    };
  }

  notify() {
    const stats = this.getLiveStats();
    const aggregates = this.getAggregates();
    this.listeners.forEach(fn => fn({ stats, aggregates, settings: this.settings }));
  }

  startRecording(reason = "MANUAL_TEST") {
    if (this.state === EngineState.RECORDING_DRIVE) return;

    this.stopDwellingCountdown();
    this.currentTripId = "trip_" + Date.now();
    this.tripStartTime = Date.now();
    this.accumulatedMeters = 0;
    this.lastLocation = null;
    this.activeWaypoints = [];
    this.filter.reset();
    this.elapsedSeconds = 0;
    this.state = EngineState.RECORDING_DRIVE;

    this.log("ENGINE", `Started active drive recording (Trigger: ${reason})`, { tripId: this.currentTripId });

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds += 1;
      this.notify();
    }, 1000);

    this.notify();
  }

  pushLocation(locationData) {
    if (this.state !== EngineState.RECORDING_DRIVE && this.state !== EngineState.DWELLING_COOLDOWN) {
      return { accepted: false, reason: "Engine is in IDLE_STANDBY" };
    }

    const evaluation = this.filter.evaluate(locationData);

    if (!evaluation.accepted) {
      this.log("FILTER", `GPS fix rejected: ${evaluation.reason}`, {
        lat: locationData.lat.toFixed(5),
        lng: locationData.lng.toFixed(5),
        accuracy: `${locationData.accuracy}m`
      });
      return evaluation;
    }

    // Vehicle resumed movement if was dwelling
    if (this.state === EngineState.DWELLING_COOLDOWN) {
      this.stopDwellingCountdown();
      this.state = EngineState.RECORDING_DRIVE;
      this.log("ENGINE", "Movement detected during cooldown: Resumed RECORDING_DRIVE");
    }

    if (evaluation.distance > 0) {
      this.accumulatedMeters += evaluation.distance;
    }

    this.lastLocation = locationData;
    this.activeWaypoints.push({
      lat: locationData.lat,
      lng: locationData.lng,
      speedMps: locationData.speed,
      accuracy: locationData.accuracy,
      time: locationData.time
    });

    const currentMiles = TaxCalculator.metersToMiles(this.accumulatedMeters);
    const currentDeduction = TaxCalculator.calculateDeduction(currentMiles);

    this.log("GPS", `Accepted waypoint #${this.activeWaypoints.length}: +${(evaluation.distance || 0).toFixed(1)}m (Total: ${currentMiles.toFixed(2)} mi, Accrued: $${currentDeduction.toFixed(2)})`);

    this.notify();
    return { accepted: true, distance: evaluation.distance, activeCount: this.activeWaypoints.length };
  }

  triggerVehicleStopped() {
    if (this.state !== EngineState.RECORDING_DRIVE) return;

    this.state = EngineState.DWELLING_COOLDOWN;
    this.dwellingSecondsLeft = 10; // Interactive fast cooldown for simulation
    this.log("ENGINE", "Vehicle stopped / Parked detected. Entering DWELLING_COOLDOWN (10s timer)");

    if (this.dwellingInterval) clearInterval(this.dwellingInterval);
    this.dwellingInterval = setInterval(() => {
      this.dwellingSecondsLeft -= 1;
      this.notify();

      if (this.dwellingSecondsLeft <= 0) {
        this.stopDwellingCountdown();
        this.finalizeTripNow("DWELLING_TIMEOUT");
      }
    }, 1000);

    this.notify();
  }

  stopDwellingCountdown() {
    if (this.dwellingInterval) {
      clearInterval(this.dwellingInterval);
      this.dwellingInterval = null;
    }
    this.dwellingSecondsLeft = 0;
  }

  finalizeTripNow(reason = "MANUAL_STOP") {
    if (this.state === EngineState.IDLE_STANDBY || !this.currentTripId) return null;

    this.stopDwellingCountdown();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const tripId = this.currentTripId;
    const endTime = Date.now();
    const totalMiles = TaxCalculator.metersToMiles(this.accumulatedMeters);
    const deduction = TaxCalculator.calculateDeduction(totalMiles);

    let savedTrip = null;

    // Minimum distance threshold to persist (0.1 miles in production, or >0.05 in test)
    if (totalMiles >= 0.05 || this.activeWaypoints.length >= 2) {
      savedTrip = {
        id: tripId,
        startTimestamp: this.tripStartTime,
        endTimestamp: endTime,
        distanceMiles: parseFloat(totalMiles.toFixed(2)),
        deductionRate: IRS_RATE_2024,
        deductionAmount: parseFloat(deduction.toFixed(2)),
        classification: TripClassification.UNCLASSIFIED,
        polyline: [...this.activeWaypoints],
        isAutoDetected: reason !== "MANUAL_STOP"
      };

      this.trips.unshift(savedTrip);
      this.saveTripsToStorage();
      this.log("ROOM_DB", `Trip finalized & saved to SQLite: ${savedTrip.distanceMiles} mi, +$${savedTrip.deductionAmount} deduction`, { tripId });
    } else {
      this.log("ENGINE", `Trip dismissed: ${totalMiles.toFixed(2)} mi below 0.1 mi threshold (e.g. driveway shift)`);
    }

    this.state = EngineState.IDLE_STANDBY;
    this.currentTripId = null;
    this.accumulatedMeters = 0;
    this.activeWaypoints = [];
    this.lastLocation = null;
    this.elapsedSeconds = 0;

    this.notify();
    return savedTrip;
  }

  classifyTrip(tripId, classification) {
    const trip = this.trips.find(t => t.id === tripId);
    if (trip) {
      trip.classification = classification;
      this.saveTripsToStorage();
      this.log("ROOM_DB", `Classified Trip ${tripId.substring(0, 8)}... as ${classification}`);
      this.notify();
    }
  }

  toggleBatteryOptimization(isIgnoring) {
    this.settings.isIgnoringBattery = isIgnoring;
    this.saveSettingsToStorage();
    this.log("SYSTEM", `Battery Optimization status updated: ${isIgnoring ? 'Whitelisted / Ignored' : 'Restricted (Warning Active)'}`);
    this.notify();
  }

  resetAllData() {
    this.trips = this.getDefaultTrips();
    this.saveTripsToStorage();
    this.log("SYSTEM", "Reset Room SQLite Database to default sample trips");
    this.notify();
  }

  // Persistence Helpers
  loadTripsFromStorage() {
    try {
      const data = localStorage.getItem(DB_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(e);
    }
    return this.getDefaultTrips();
  }

  saveTripsToStorage() {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.trips));
    } catch (e) {
      console.error(e);
    }
  }

  loadSettingsFromStorage() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error(e);
    }
    return { isIgnoringBattery: false };
  }

  saveSettingsFromStorage() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error(e);
    }
  }

  getDefaultTrips() {
    const now = Date.now();
    return [
      {
        id: "trip-sample-1",
        startTimestamp: now - 3600000 * 2, // 2 hours ago
        endTimestamp: now - 3600000 * 1.5,
        distanceMiles: 14.2,
        deductionRate: 0.67,
        deductionAmount: 9.51,
        classification: TripClassification.BUSINESS,
        polyline: [],
        isAutoDetected: true
      },
      {
        id: "trip-sample-2",
        startTimestamp: now - 3600000 * 5, // 5 hours ago
        endTimestamp: now - 3600000 * 4.6,
        distanceMiles: 4.8,
        deductionRate: 0.67,
        deductionAmount: 3.22,
        classification: TripClassification.UNCLASSIFIED,
        polyline: [],
        isAutoDetected: true
      },
      {
        id: "trip-sample-3",
        startTimestamp: now - 86400000, // Yesterday
        endTimestamp: now - 86400000 + 1800000,
        distanceMiles: 8.5,
        deductionRate: 0.67,
        deductionAmount: 5.70,
        classification: TripClassification.BUSINESS,
        polyline: [],
        isAutoDetected: true
      }
    ];
  }
}
