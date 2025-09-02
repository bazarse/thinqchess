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
      tournamentId,
      currentStatus: existingTournament.status,
      currentIsActive: existingTournament.is_active
    });

    // Check if we're actually making a change
    const statusChanged = existingTournament.status !== body.status;
    const isActiveChanged = existingTournament.is_active !== isActiveValue;

    console.log('🔍 Change detection:', {
      statusChanged,
      isActiveChanged,
      willUpdate: statusChanged || isActiveChanged
    });

    if (!statusChanged && !isActiveChanged) {
      console.log('ℹ️ No changes needed - tournament already has the requested values');
      return NextResponse.json({
        success: true,
        message: 'Tournament status is already up to date'
      });
    }

    // If activating this tournament, deactivate all others first
    if (isActiveValue === 1 && isActiveChanged) {
      console.log('🔄 Deactivating other tournaments first...');
      const deactivateResult = db.prepare(`
        UPDATE tournaments
        SET is_active = 0, updated_at = ?
        WHERE id != ? AND is_active = 1
      `).run(new Date().toISOString(), tournamentId);

      console.log('✅ Deactivated other tournaments:', deactivateResult);
    }

    const result = db.prepare(`
      UPDATE tournaments
      SET status = ?, is_active = ?, updated_at = ?
      WHERE id = ?
    `).run(body.status, isActiveValue, new Date().toISOString(), tournamentId);

    console.log('✅ Tournament update result:', result);

    if (result.changes === 0) {
      console.log('❌ Update failed - no changes made despite detection');
      return NextResponse.json(
        { error: 'Failed to update tournament - database update failed' },
        { status: 500 }
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
