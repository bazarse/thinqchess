import { NextResponse } from 'next/server';

// GET - Fetch specific tournament
export async function GET(request, { params }) {
  try {
    const SimpleDatabase = (await import('../../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    const resolvedParams = await params;
    const tournamentId = resolvedParams.id;

    // Get tournament details
    const tournament = await db.get('SELECT * FROM tournaments WHERE id = ?', [tournamentId]);
    
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
    const SimpleDatabase = (await import('../../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    const resolvedParams = await params;
    const tournamentId = resolvedParams.id;
    const body = await request.json();

    console.log('🔄 Updating tournament status:', {
      tournamentId,
      tournamentIdType: typeof tournamentId,
      status: body.status,
      is_active: body.is_active,
      is_active_type: typeof body.is_active
    });

    // First check if tournament exists
    const existingTournament = await db.get('SELECT * FROM tournaments WHERE id = ?', [tournamentId]);
    console.log('🔍 Existing tournament:', existingTournament);

    if (!existingTournament) {
      console.log('❌ Tournament not found with ID:', tournamentId);
      return NextResponse.json(
        { error: `Tournament not found with ID: ${tournamentId}` },
        { status: 404 }
      );
    }

    // Update tournament status - ensure is_active is properly converted to integer
    const isActiveValue = body.is_active === true || body.is_active === 1 || body.is_active === '1' ? 1 : 0;

    console.log('🔄 Performing update with values:', {
      status: body.status,
      isActiveValue,
      tournamentId
    });

    const result = await db.run(`
      UPDATE tournaments
      SET status = ?, is_active = ?, updated_at = ?
      WHERE id = ?
    `, [body.status, isActiveValue, new Date().toISOString(), tournamentId]);

    console.log('✅ Tournament update result:', result);

    if (result.changes === 0) {
      console.log('❌ Update failed - no changes made');
      return NextResponse.json(
        { error: 'Failed to update tournament - no changes made' },
        { status: 400 }
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
