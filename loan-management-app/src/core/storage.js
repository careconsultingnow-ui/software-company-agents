/**
 * LendTrack - Local Storage and Audit Log Manager
 */

import { generateSeedData } from '../data/seedData.js';

const STORAGE_KEY = 'LENDTRACK_DB_V1';

export function getStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateSeedData();
      saveStoredData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Basic schema validation
    if (!parsed.borrowers || !parsed.loans || !parsed.installments) {
      const initial = generateSeedData();
      saveStoredData(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to parse localStorage data, resetting to seed:', err);
    const initial = generateSeedData();
    saveStoredData(initial);
    return initial;
  }
}

export function saveStoredData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving data to localStorage:', err);
  }
}

export function resetToSeedData() {
  const seed = generateSeedData();
  saveStoredData(seed);
  return seed;
}

export function addAuditLog(data, { action, target, details, user = 'Patrick (Owner)' }) {
  const entry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    action,
    user,
    target,
    details,
    timestamp: new Date().toISOString()
  };
  data.auditLogs = [entry, ...(data.auditLogs || [])];
  saveStoredData(data);
  return entry;
}
