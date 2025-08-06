import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get completed tournaments from SQLite
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Get tournaments with status 'completed'
    const tournaments = db.prepare('SELECT * FROM tournaments WHERE status = ? ORDER BY end_date DESC').all('completed');

    // Get registrations for each tournament
    const tournamentsWithRegistrations = tournaments.map(tournament => {
      const registrations = db.prepare('SELECT * FROM registrations WHERE tournament_id = ? ORDER BY registered_at DESC').all(tournament.id);
      return {
        ...tournament,
        registrations: registrations || []
      };
    });

    // Calculate stats for each tournament
    const tournamentsWithStats = tournamentsWithRegistrations.map(tournament => {
      const registrations = tournament.registrations || [];
      const completedRegistrations = registrations.filter(reg => reg.payment_status === 'completed');

      return {
        ...tournament,
        total_registrations: completedRegistrations.length,
        total_revenue: completedRegistrations.reduce((sum, reg) => sum + (parseFloat(reg.amount_paid) || 0), 0),
        registrations: completedRegistrations.map(reg => ({
          ...reg,
          participant_name: `${reg.participant_first_name} ${reg.participant_last_name}`
        }))
      };
    });

    return NextResponse.json({
      success: true,
      tournaments: tournamentsWithStats
    });

  } catch (error) {
    console.error('Error in past tournaments API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
