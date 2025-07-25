import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Development mode - return default settings
    if (process.env.DEVELOPMENT_MODE === 'true') {
      return NextResponse.json({
        tournament_fee: 400.00,
        registration_fee: 500.00,
        max_participants: 52,
        countdown_end_date: null
      });
    }

    // Production mode with database
    const { getAdminSettings } = await import('../../../../../lib/db.js');
    const settings = await getAdminSettings();

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        tournament_fee: 400.00,
        registration_fee: 500.00,
        max_participants: 52,
        countdown_end_date: null
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    // Fallback to default settings
    return NextResponse.json({
      tournament_fee: 400.00,
      registration_fee: 500.00,
      max_participants: 52,
      countdown_end_date: null
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tournament_fee, registration_fee, max_participants, countdown_end_date, tournament_types } = body;

    // Validate input
    if (!tournament_fee || !registration_fee || !max_participants) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (tournament_fee < 0 || registration_fee < 0 || max_participants < 1) {
      return NextResponse.json(
        { error: 'Invalid values provided' },
        { status: 400 }
      );
    }

    // Development mode - return success without database
    if (process.env.DEVELOPMENT_MODE === 'true') {
      return NextResponse.json({
        tournament_fee: parseFloat(tournament_fee),
        registration_fee: parseFloat(registration_fee),
        max_participants: parseInt(max_participants),
        countdown_end_date: countdown_end_date || null,
        tournament_types: tournament_types || [],
        message: 'Settings updated successfully (development mode)'
      });
    }

    // Production mode with database
    const { updateAdminSettings } = await import('../../../../../lib/db.js');
    const updatedSettings = await updateAdminSettings({
      tournament_fee: parseFloat(tournament_fee),
      registration_fee: parseFloat(registration_fee),
      max_participants: parseInt(max_participants),
      countdown_end_date: countdown_end_date || null,
      tournament_types: tournament_types || []
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
