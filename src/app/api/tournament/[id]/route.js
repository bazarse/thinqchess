import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Get tournament by ID
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(parseInt(id));

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