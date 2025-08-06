import { NextResponse } from 'next/server';
import { getTournamentsByStatus, getAllTournaments } from '../../../../../lib/sqlite-operations.js';
import { updateTournamentStatus } from '../../../../lib/tournament-utils.js';

export async function GET() {
  try {
    // Auto-update tournament status first
    const { getDB } = require('../../../../lib/database.js');
    const db = getDB();
    await updateTournamentStatus(db);

    // Get active and upcoming tournaments from PostgreSQL
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get active tournaments (currently running)
    const activeTournamentsResult = await db.prepare('SELECT * FROM tournaments WHERE status = ? ORDER BY start_date DESC').all('active');
    const activeTournaments = activeTournamentsResult.filter(tournament => {
      return tournament.start_date <= currentDate && tournament.end_date >= currentDate;
    });

    // Get upcoming tournaments (registration not started yet)
    const upcomingTournaments = getTournamentsByStatus('upcoming').filter(tournament => {
      return tournament.registration_start_date > currentDate;
    }).sort((a, b) => new Date(a.registration_start_date) - new Date(b.registration_start_date));

    // Get tournaments with open registration (registration period active)
    const openRegistrationTournaments = getTournamentsByStatus('upcoming').filter(tournament => {
      return tournament.registration_start_date <= currentDate && tournament.registration_end_date >= currentDate;
    });

    // Determine tournament status
    let tournamentStatus = {
      hasActiveTournaments: activeTournaments.length > 0,
      hasUpcomingTournaments: upcomingTournaments.length > 0,
      hasOpenRegistration: openRegistrationTournaments.length > 0,
      activeTournaments: activeTournaments,
      upcomingTournaments: upcomingTournaments,
      openRegistrationTournaments: openRegistrationTournaments,
      currentDate
    };

    // Determine what to show on frontend
    if (tournamentStatus.hasOpenRegistration) {
      // Show registration form with payment
      return NextResponse.json({
        status: 'registration_open',
        message: 'Tournament registration is open!',
        showRegistrationForm: true,
        showPayment: true,
        tournaments: openRegistrationTournaments,
        ...tournamentStatus
      });
    } else if (tournamentStatus.hasUpcomingTournaments) {
      // Show countdown timer
      const nextTournament = upcomingTournaments[0];
      return NextResponse.json({
        status: 'upcoming',
        message: `Registration will start from ${new Date(nextTournament.registration_start_date).toLocaleDateString()}`,
        showRegistrationForm: false,
        showCountdown: true,
        countdownTarget: nextTournament.registration_start_date,
        nextTournament,
        ...tournamentStatus
      });
    } else if (tournamentStatus.hasActiveTournaments) {
      // Tournament running but registration closed
      return NextResponse.json({
        status: 'registration_closed',
        message: 'Tournament is currently running. Registration is closed.',
        showRegistrationForm: false,
        showPayment: false,
        ...tournamentStatus
      });
    } else {
      // No tournaments
      return NextResponse.json({
        status: 'no_tournaments',
        message: 'Tournaments are closed now. Please check back later.',
        showRegistrationForm: false,
        showPayment: false,
        ...tournamentStatus
      });
    }

  } catch (error) {
    console.error('Error checking tournament status:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Unable to check tournament status. Please try again later.',
      showRegistrationForm: false,
      showPayment: false,
      hasActiveTournaments: false,
      hasUpcomingTournaments: false,
      hasOpenRegistration: false
    });
  }
}
