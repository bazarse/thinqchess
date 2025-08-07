import { NextResponse } from 'next/server';
import { getCompletedTournaments } from '../../../../../lib/tournament-utils.js';
import { tournamentStatusMiddleware } from '../../../../../lib/tournament-scheduler.js';

export async function GET() {
  try {
    // Get completed tournaments from SimpleDB with auto-status update
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Use the utility function to get completed tournaments with registrations
    const tournamentsWithStats = await getCompletedTournaments(db);

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
