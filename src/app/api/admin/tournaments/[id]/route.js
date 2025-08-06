import { NextResponse } from 'next/server';

// GET - Fetch specific tournament
export async function GET(request, { params }) {
  try {
    const { pool } = require('../../../../../../lib/database.js');

    const resolvedParams = await params;
    const tournamentId = resolvedParams.id;

    // Get tournament details
    const result = await pool.query('SELECT * FROM tournaments WHERE id = $1', [tournamentId]);
    const tournament = result.rows[0];
    
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
    const { pool } = require('../../../../../../lib/database.js');

    const resolvedParams = await params;
    const tournamentId = resolvedParams.id;
    const body = await request.json();

    // Update tournament status
    const result = await pool.query(`
      UPDATE tournaments
      SET status = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [body.status, body.is_active, tournamentId]);

    if (result.rowCount === 0) {
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
