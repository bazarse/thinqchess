import { NextResponse } from 'next/server';
import { getCompletedTournaments } from '../../../../../lib/tournament-utils.js';
import { tournamentStatusMiddleware } from '../../../../../lib/tournament-scheduler.js';

export async function GET() {
  try {
    // Get completed tournaments from SQLite with auto-status update
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Auto-update tournament status using middleware
    const updateResults = tournamentStatusMiddleware(db, true); // Force update for past tournaments

    // Use the utility function to get completed tournaments with registrations
    const tournamentsWithStats = getCompletedTournaments(db);

    console.log(`📊 Found ${tournamentsWithStats.length} completed tournaments`);

    // Log registration counts for debugging
    tournamentsWithStats.forEach(tournament => {
      console.log(`Tournament: ${tournament.name} - Registrations: ${tournament.total_registrations}`);
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
