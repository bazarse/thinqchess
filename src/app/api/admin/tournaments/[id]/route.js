import { NextResponse } from 'next/server';

// GET - Fetch specific tournament
export async function GET(request, { params }) {
  try {
    const { getDB } = require('../../../../../../lib/database.js');
    const db = getDB();

    const resolvedParams = await params;
    const tournamentId = resolvedParams.id;

    // Get tournament details
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tournament
    });

  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}

// PATCH - Update tournament status
export async function PATCH(request, { params }) {
  try {
    const { getDB } = require('../../../../../../lib/database.js');
    const db = getDB();

    const resolvedParams = await params;
    const tournamentId = resolvedParams.id;
    const body = await request.json();

    // Update tournament status
    const result = db.prepare(`
      UPDATE tournaments
      SET status = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(body.status, body.is_active, tournamentId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tournament status updated successfully'
    });

  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    );
  }
}
