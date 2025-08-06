// Tournament Status Scheduler
// This module provides automatic tournament status updates

import { updateTournamentStatus } from './tournament-utils.js';

let lastUpdateTime = null;
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Check if tournament status needs to be updated
 * @returns {boolean} - Whether update is needed
 */
function shouldUpdate() {
  if (!lastUpdateTime) return true;
  
  const now = Date.now();
  return (now - lastUpdateTime) >= UPDATE_INTERVAL;
}

/**
 * Auto-update tournament status if needed
 * @param {Object} db - Database connection
 * @returns {Object|null} - Update results or null if no update needed
 */
export function autoUpdateTournamentStatus(db) {
  if (!shouldUpdate()) {
    return null;
  }

  try {
    const results = updateTournamentStatus(db);
    lastUpdateTime = Date.now();
    
    console.log(`🔄 Auto-updated tournament status at ${new Date().toISOString()}`);
    
    return results;
  } catch (error) {
    console.error('Error in auto-update tournament status:', error);
    return null;
  }
}

/**
 * Force update tournament status regardless of timing
 * @param {Object} db - Database connection
 * @returns {Object} - Update results
 */
export function forceUpdateTournamentStatus(db) {
  try {
    const results = updateTournamentStatus(db);
    lastUpdateTime = Date.now();
    
    console.log(`🔄 Force-updated tournament status at ${new Date().toISOString()}`);
    
    return results;
  } catch (error) {
    console.error('Error in force-update tournament status:', error);
    throw error;
  }
}

/**
 * Get last update time
 * @returns {number|null} - Last update timestamp or null
 */
export function getLastUpdateTime() {
  return lastUpdateTime;
}

/**
 * Reset update timer (useful for testing)
 */
export function resetUpdateTimer() {
  lastUpdateTime = null;
}

/**
 * Set custom update interval (useful for testing)
 * @param {number} interval - Interval in milliseconds
 */
export function setUpdateInterval(interval) {
  UPDATE_INTERVAL = interval;
}

/**
 * Initialize tournament status scheduler
 * This can be called when the application starts
 */
export function initializeTournamentScheduler() {
  console.log('🚀 Tournament status scheduler initialized');
  
  // Set up periodic updates (optional - can be enabled if needed)
  // setInterval(() => {
  //   try {
  //     const { getDB } = require('./database.js');
  //     const db = getDB();
  //     autoUpdateTournamentStatus(db);
  //   } catch (error) {
  //     console.error('Error in scheduled tournament update:', error);
  //   }
  // }, UPDATE_INTERVAL);
}

/**
 * Middleware function to auto-update tournament status on API calls
 * @param {Object} db - Database connection
 * @param {boolean} force - Whether to force update regardless of timing
 * @returns {Object|null} - Update results or null
 */
export function tournamentStatusMiddleware(db, force = false) {
  if (force) {
    return forceUpdateTournamentStatus(db);
  } else {
    return autoUpdateTournamentStatus(db);
  }
}
