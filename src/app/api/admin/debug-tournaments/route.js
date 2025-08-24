import { NextResponse } from 'next/server';
import { updateTournamentStatus } from '../../../../../lib/tournament-utils.js';

export async function GET() {
  try {
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Get all tournaments with their current status
    const allTournaments = await db.all(`
      SELECT id, name, start_date, end_date, status, is_active, created_at, updated_at
      FROM tournaments 
      ORDER BY end_date DESC
    `);

    const today = new Date().toISOString().split('T')[0];
    
    // Analyze each tournament
    const tournamentAnalysis = allTournaments.map(tournament => {
      const endDate = tournament.end_date;
      const isExpired = endDate < today;
      const shouldBeCompleted = isExpired && tournament.status !== 'completed';
      
      return {
        ...tournament,
        end_date_formatted: new Date(endDate).toLocaleDateString('en-GB'),
        is_expired: isExpired,
        should_be_completed: shouldBeCompleted,
        days_since_end: isExpired ? Math.floor((new Date(today) - new Date(endDate)) / (1000 * 60 * 60 * 24)) : null
      };
    });

    // Count by status
    const statusCounts = {
      upcoming: allTournaments.filter(t => t.status === 'upcoming').length,
      active: allTournaments.filter(t => t.status === 'active').length,
      completed: allTournaments.filter(t => t.status === 'completed').length,
      other: allTournaments.filter(t => !['upcoming', 'active', 'completed'].includes(t.status)).length
    };

    // Find tournaments that should be completed but aren't
    const needsStatusUpdate = tournamentAnalysis.filter(t => t.should_be_completed);

    return NextResponse.json({
      success: true,
      debug_info: {
        total_tournaments: allTournaments.length,
        status_counts: statusCounts,
        tournaments_needing_update: needsStatusUpdate.length,
        current_date: today
      },
      tournaments: tournamentAnalysis,
      needs_update: needsStatusUpdate
    });

  } catch (error) {
    console.error('Error in debug tournaments API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Force update tournament status
export async function POST() {
  try {
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    console.log('🔄 Force updating tournament status...');
    const results = await updateTournamentStatus(db);

    return NextResponse.json({
      success: true,
      message: 'Tournament status updated successfully',
      results
    });

  } catch (error) {
    console.error('Error force updating tournament status:', error);
    return NextResponse.json({ 
      error: 'Failed to update tournament status',
      details: error.message 
    }, { status: 500 });
  }
}
