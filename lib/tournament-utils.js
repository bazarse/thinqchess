// Tournament utility functions for status management and data processing

/**
 * Auto-update tournament status based on current date
 * @param {Object} db - Database connection (SimpleDB or SQLite interface)
 * @returns {Object} - Update results
 */
export async function updateTournamentStatus(db) {
  const today = new Date().toISOString().split('T')[0];
  const results = {
    completedCount: 0,
    activeCount: 0,
    errors: []
  };

  try {
    // Only move tournaments to completed if they are currently 'active' and end_date has passed
    const completedResult = await db.run(
      "UPDATE tournaments SET status = 'completed' WHERE end_date < ? AND status = 'active'",
      [today]
    );

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
    const activeResult = await db.run(
      "UPDATE tournaments SET status = 'active' WHERE start_date <= ? AND end_date >= ? AND status = 'upcoming'",
      [today, today]
    );

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
 * @param {Object} db - Database connection (SimpleDB)
 * @param {string} status - Tournament status filter
 * @returns {Array} - Tournaments with registration data
 */
export async function getTournamentsWithRegistrations(db, status = null) {
  try {
    // First update tournament status
    await updateTournamentStatus(db);

    // Get tournaments based on status
    let tournaments;

    if (status) {
      tournaments = await db.all("SELECT * FROM tournaments WHERE status = ? ORDER BY end_date DESC", [status]);
    } else {
      tournaments = await db.all("SELECT * FROM tournaments ORDER BY end_date DESC");
    }

    // Get registrations for each tournament
    const tournamentsWithRegistrations = await Promise.all(tournaments.map(async tournament => {
      let registrations = [];

      try {
        // Get registrations from tournament_registrations table
        registrations = await db.all(
          "SELECT * FROM tournament_registrations WHERE tournament_id = ? AND payment_status = 'completed' ORDER BY created_at DESC",
          [tournament.id]
        );
      } catch (error) {
        console.log('Error fetching registrations:', error);
        registrations = [];
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
 * @param {Object} db - Database connection (SimpleDB)
 * @returns {Array} - Completed tournaments with registration data
 */
export async function getCompletedTournaments(db) {
  return await getTournamentsWithRegistrations(db, 'completed');
}

/**
 * Get active tournaments specifically
 * @param {Object} db - Database connection (SimpleDB)
 * @returns {Array} - Active tournaments with registration data
 */
export async function getActiveTournaments(db) {
  return await getTournamentsWithRegistrations(db, 'active');
}

/**
 * Get upcoming tournaments specifically
 * @param {Object} db - Database connection (SimpleDB)
 * @returns {Array} - Upcoming tournaments with registration data
 */
export async function getUpcomingTournaments(db) {
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
