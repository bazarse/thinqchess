import { NextResponse } from 'next/server';
import { updateTournamentStatus } from '../../../../../lib/tournament-utils.js';

// GET - Fetch all tournaments
export async function GET() {
  try {
    // Auto-update tournament status based on dates using utility function
    updateTournamentStatus();

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();
    const tournaments = db.prepare('SELECT * FROM tournaments ORDER BY created_at DESC').all();

    console.log('📋 Fetched tournaments:', tournaments.length, 'tournaments');

    return NextResponse.json({
      success: true,
      tournaments
    });

  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}

// POST - Create new tournament
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      tournament_date,
      start_date,
      end_date,
      registration_start,
      registration_end,
      flyer_image,
      is_active,
      categories
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Tournament name is required' },
        { status: 400 }
      );
    }

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // If this tournament is being set as active, deactivate all others
    if (is_active) {
      db.prepare('UPDATE tournaments SET is_active = 0').run();
    }

    // Insert new tournament
    const result = db.prepare(`
      INSERT INTO tournaments (
        name, description, start_date, end_date,
        registration_start_date, registration_end_date, flyer_image, is_active, categories
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      description || '',
      tournament_date || start_date || '2024-12-31', // Use tournament_date or fallback to start_date
      tournament_date || end_date || '2024-12-31',   // Use tournament_date or fallback to end_date
      registration_start || null,
      registration_end || null,
      flyer_image || '',
      is_active ? 1 : 0,
      categories || '[]'
    );

    // Get the created tournament
    const newTournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(result.lastInsertRowid);

    console.log('✅ Tournament created successfully:', newTournament);

    return NextResponse.json({
      success: true,
      message: 'Tournament created successfully',
      tournament: newTournament
    });

  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}

// PUT - Update tournament
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      tournament_date,
      start_date,
      end_date,
      registration_start,
      registration_end,
      flyer_image,
      is_active,
      categories
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Check if tournament exists
    const existing = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // If this tournament is being set as active, deactivate all others
    if (is_active) {
      db.prepare('UPDATE tournaments SET is_active = 0').run();
    }

    // Update tournament
    db.prepare(`
      UPDATE tournaments
      SET name = ?, description = ?, start_date = ?, end_date = ?,
          registration_start_date = ?, registration_end_date = ?, flyer_image = ?,
          is_active = ?, categories = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || existing.name,
      description !== undefined ? description : existing.description,
      tournament_date !== undefined ? tournament_date : (start_date !== undefined ? start_date : existing.start_date),
      tournament_date !== undefined ? tournament_date : (end_date !== undefined ? end_date : existing.end_date),
      registration_start !== undefined ? registration_start : existing.registration_start_date,
      registration_end !== undefined ? registration_end : existing.registration_end_date,
      flyer_image !== undefined ? flyer_image : existing.flyer_image,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      categories !== undefined ? categories : existing.categories,
      id
    );

    // Get updated tournament
    const updatedTournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      message: 'Tournament updated successfully',
      tournament: updatedTournament
    });

  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    );
  }
}

// DELETE - Delete tournament
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));

    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Check if tournament exists
    const existing = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    try {
      console.log(`🗑️ Deleting tournament with ID: ${id}`);

      // Delete related registrations first
      db.prepare('DELETE FROM registrations WHERE tournament_id = ?').run(id);
      db.prepare('DELETE FROM tournament_registrations WHERE tournament_id = ?').run(id);

      // Delete tournament
      const result = db.prepare('DELETE FROM tournaments WHERE id = ?').run(id);

      console.log(`✅ Tournament ${id} deleted successfully. Rows affected: ${result.changes}`);

    } catch (deleteError) {
      console.error('Error during deletion:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Tournament deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    );
  }
}
