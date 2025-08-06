import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use SimpleDB for Vercel compatibility
    const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Auto-update tournament status
    const currentDate = new Date().toISOString().split('T')[0];

    // Update expired tournaments to completed
    await db.run(
      "UPDATE tournaments SET status = 'completed' WHERE end_date < ? AND status = 'active'",
      [currentDate]
    );

    // Update tournaments that should be active
    await db.run(
      "UPDATE tournaments SET status = 'active' WHERE start_date <= ? AND end_date >= ? AND status = 'upcoming'",
      [currentDate, currentDate]
    );

    // Get active tournaments (currently running)
    const activeTournaments = await db.all(
      "SELECT * FROM tournaments WHERE status = 'active' ORDER BY start_date DESC"
    );

    // Get upcoming tournaments (registration not started yet)
    const upcomingTournaments = await db.all(
      "SELECT * FROM tournaments WHERE status = 'upcoming' ORDER BY start_date ASC"
    );

    // Get tournaments with open registration (registration period active)
    const openRegistrationTournaments = await db.all(
      "SELECT * FROM tournaments WHERE status = 'active' AND is_active = 1 ORDER BY start_date DESC"
    );

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
