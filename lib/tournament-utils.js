// Tournament utility functions for status management and data processing
const { db } = require('./database.js');

/**
 * Auto-update tournament status based on current date
 * @param {Object} db - Database connection (optional for PostgreSQL)
 * @returns {Object} - Update results
 */
export function updateTournamentStatus() {
  const today = new Date().toISOString().split('T')[0];
  const results = {
    completedCount: 0,
    activeCount: 0,
    errors: []
  };

  try {
    // Only move tournaments to completed if they are currently 'active' and end_date has passed
    // This prevents tournaments from automatically going to completed status
    const completedResult = db.prepare(`
      UPDATE tournaments
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE end_date < ? AND status = 'active'
    `).run(today);

    results.completedCount = completedResult.changes || 0;

    if (results.completedCount > 0) {
      console.log(`✅ Auto-updated ${results.completedCount} tournaments to completed status`);
    }
  } catch (error) {
    console.error('Error updating tournaments to completed:', error);
    results.errors.push(`Completed update error: ${error.message}`);
  }

  try {
    // Update tournaments to 'active' if they are currently running
    const activeResult = db.prepare(`
      UPDATE tournaments
      SET status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE start_date <= ? AND end_date >= ? AND status = 'upcoming'
    `).run(today, today);

    results.activeCount = activeResult.changes || 0;
    
    if (results.activeCount > 0) {
      console.log(`✅ Auto-updated ${results.activeCount} tournaments to active status`);
    }
  } catch (error) {
    console.error('Error updating tournaments to active:', error);
    results.errors.push(`Active update error: ${error.message}`);
  }

  return results;
}

/**
 * Get tournaments with their registration data
 * @param {Object} db - Database connection (optional for PostgreSQL)
 * @param {string} status - Tournament status filter
 * @returns {Array} - Tournaments with registration data
 */
export async function getTournamentsWithRegistrations(db = null, status = null) {
  try {
    // First update tournament status
    await updateTournamentStatus(db);

    // Get tournaments based on status
    let tournaments;

    if (status) {
      tournaments = await pool.query(`SELECT * FROM tournaments WHERE status = $1 ORDER BY end_date DESC`, [status]);
    } else {
      tournaments = await pool.query(`SELECT * FROM tournaments ORDER BY end_date DESC`);
    }

    tournaments = tournaments.rows;

    // Get registrations for each tournament
    const tournamentsWithRegistrations = await Promise.all(tournaments.map(async tournament => {
      // Try both registration tables for backward compatibility
      let registrations = [];

      try {
        // Try the main registrations table first
        const regResult = await pool.query(`
          SELECT * FROM registrations
          WHERE tournament_id = $1 AND payment_status = 'completed'
          ORDER BY registered_at DESC
        `, [tournament.id]);
        registrations = regResult.rows;
      } catch (error) {
        console.log('Main registrations table query failed, trying tournament_registrations');
      }

      // If no registrations found in main table, try tournament_registrations table
      if (registrations.length === 0) {
        try {
          const tournRegResult = await pool.query(`
            SELECT * FROM tournament_registrations
            WHERE tournament_id = $1 AND payment_status = 'completed'
            ORDER BY registered_at DESC
          `, [tournament.id]);
          registrations = tournRegResult.rows;
        } catch (error) {
          console.log('Tournament_registrations table query failed');
        }
      }

      return {
        ...tournament,
        registrations: registrations || []
      };
    }));

    // Calculate stats for each tournament
    const tournamentsWithStats = tournamentsWithRegistrations.map(tournament => {
      const registrations = tournament.registrations || [];
      const completedRegistrations = registrations.filter(reg => 
        reg.payment_status === 'completed' || reg.payment_status === 'success'
      );

      return {
        ...tournament,
        total_registrations: completedRegistrations.length,
        total_revenue: completedRegistrations.reduce((sum, reg) => {
          const amount = parseFloat(reg.amount_paid || reg.amount || 0);
          return sum + amount;
        }, 0),
        registrations: completedRegistrations.map(reg => ({
          ...reg,
          participant_name: reg.participant_first_name && reg.participant_last_name 
            ? `${reg.participant_first_name} ${reg.participant_last_name}`
            : reg.full_name || 'Unknown'
        }))
      };
    });

    return tournamentsWithStats;
  } catch (error) {
    console.error('Error getting tournaments with registrations:', error);
    throw error;
  }
}

/**
 * Get completed tournaments specifically
 * @param {Object} db - Database connection (optional for PostgreSQL)
 * @returns {Array} - Completed tournaments with registration data
 */
export async function getCompletedTournaments(db = null) {
  return await getTournamentsWithRegistrations(db, 'completed');
}

/**
 * Get active tournaments specifically
 * @param {Object} db - Database connection (optional for PostgreSQL)
 * @returns {Array} - Active tournaments with registration data
 */
export async function getActiveTournaments(db = null) {
  return await getTournamentsWithRegistrations(db, 'active');
}

/**
 * Get upcoming tournaments specifically
 * @param {Object} db - Database connection (optional for PostgreSQL)
 * @returns {Array} - Upcoming tournaments with registration data
 */
export async function getUpcomingTournaments(db = null) {
  return await getTournamentsWithRegistrations(db, 'upcoming');
}

/**
 * Format tournament date for display
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date
 */
export function formatTournamentDate(dateString) {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Check if tournament registration is open
 * @param {Object} tournament - Tournament object
 * @returns {boolean} - Whether registration is open
 */
export function isTournamentRegistrationOpen(tournament) {
  if (!tournament) return false;
  
  const now = new Date();
  const startDate = tournament.registration_start_date ? new Date(tournament.registration_start_date) : null;
  const endDate = tournament.registration_end_date ? new Date(tournament.registration_end_date) : null;
  
  // If no registration dates set, check tournament status
  if (!startDate || !endDate) {
    return tournament.status === 'upcoming' || tournament.status === 'active';
  }
  
  // Check if current date is within registration period
  return now >= startDate && now <= endDate && tournament.status !== 'completed';
}

/**
 * Get tournament status display text
 * @param {Object} tournament - Tournament object
 * @returns {string} - Status display text
 */
export function getTournamentStatusText(tournament) {
  if (!tournament) return 'Unknown';
  
  switch (tournament.status) {
    case 'upcoming':
      return 'Upcoming';
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return tournament.status || 'Unknown';
  }
}
