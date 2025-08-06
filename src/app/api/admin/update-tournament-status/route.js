import { NextResponse } from 'next/server';
import { updateTournamentStatus } from '../../../../../lib/tournament-utils.js';

// POST - Manually trigger tournament status update
export async function POST() {
  try {
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Update tournament status
    const results = updateTournamentStatus(db);

    return NextResponse.json({
      success: true,
      message: 'Tournament status updated successfully',
      results: {
        completedCount: results.completedCount,
        activeCount: results.activeCount,
        errors: results.errors
      }
    });

  } catch (error) {
    console.error('Error updating tournament status:', error);
    return NextResponse.json(
      { error: 'Failed to update tournament status' },
      { status: 500 }
    );
  }
}

// GET - Check tournament status and return current state
export async function GET() {
  try {
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Update tournament status first
    const results = updateTournamentStatus(db);

    // Get current tournament counts by status
    const statusCounts = {
      upcoming: 0,
      active: 0,
      completed: 0,
      cancelled: 0
    };

    try {
      const counts = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM tournaments 
        GROUP BY status
      `).all();

      counts.forEach(row => {
        if (statusCounts.hasOwnProperty(row.status)) {
          statusCounts[row.status] = row.count;
        }
      });
    } catch (error) {
      console.error('Error getting status counts:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Tournament status checked',
      updateResults: results,
      statusCounts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking tournament status:', error);
    return NextResponse.json(
      { error: 'Failed to check tournament status' },
      { status: 500 }
    );
  }
}
