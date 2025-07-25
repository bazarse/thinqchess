import { NextResponse } from 'next/server';

// In-memory storage for development mode
let developmentSettings = {
  tournament_registration_active: false,
  tournament_registration_mode: 'manual', // 'manual', 'scheduled', 'countdown'
  tournament_open_date: '',
  tournament_close_date: '',
  tournament_closed_message: 'Registration is currently closed. Please check back later.',
  course_registration_active: true,
  coming_soon_message: "Coming Soon! Get ready for the biggest chess tournament of the year!"
};

export async function GET() {
  try {
    // Development mode - return settings from in-memory storage
    if (process.env.DEVELOPMENT_MODE === 'true') {
      return NextResponse.json(developmentSettings);
    }

    // Production mode with database
    const { sql } = await import('@vercel/postgres');
    const result = await sql`
      SELECT * FROM admin_settings
      ORDER BY id DESC LIMIT 1
    `;

    const settings = result.rows[0];

    return NextResponse.json({
      tournament_registration_active: settings?.tournament_registration_active ?? false,
      tournament_registration_mode: settings?.tournament_registration_mode ?? 'manual',
      tournament_open_date: settings?.tournament_open_date ?? '',
      tournament_close_date: settings?.tournament_close_date ?? '',
      tournament_closed_message: settings?.tournament_closed_message ?? 'Registration is currently closed. Please check back later.',
      course_registration_active: settings?.course_registration_active ?? true,
      coming_soon_message: settings?.coming_soon_message ?? "Coming Soon! New tournament season starting soon."
    });
  } catch (error) {
    console.error('Error fetching page status:', error);
    // Fallback to default settings
    return NextResponse.json({
      tournament_registration_active: false,
      tournament_registration_mode: 'manual',
      tournament_open_date: '',
      tournament_close_date: '',
      tournament_closed_message: 'Registration is currently closed. Please check back later.',
      course_registration_active: true,
      coming_soon_message: "Coming Soon! Get ready for the biggest chess tournament of the year!"
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      tournament_registration_active,
      tournament_registration_mode,
      tournament_open_date,
      tournament_close_date,
      tournament_closed_message,
      course_registration_active,
      coming_soon_message
    } = body;

    // Development mode - update in-memory storage
    if (process.env.DEVELOPMENT_MODE === 'true') {
      developmentSettings = {
        tournament_registration_active,
        tournament_registration_mode,
        tournament_open_date,
        tournament_close_date,
        tournament_closed_message,
        course_registration_active,
        coming_soon_message
      };

      console.log('🎛️ Page Status Updated:', developmentSettings);

      return NextResponse.json({
        success: true,
        message: 'Page status updated successfully (development mode)',
        ...developmentSettings
      });
    }

    // Production mode with database
    const { sql } = await import('@vercel/postgres');
    await sql`
      UPDATE admin_settings
      SET tournament_registration_active = ${tournament_registration_active},
          course_registration_active = ${course_registration_active},
          coming_soon_message = ${coming_soon_message},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM admin_settings ORDER BY id DESC LIMIT 1)
    `;

    return NextResponse.json({
      success: true,
      message: 'Page status updated successfully'
    });
  } catch (error) {
    console.error('Error updating page status:', error);
    return NextResponse.json(
      { error: 'Failed to update page status' },
      { status: 500 }
    );
  }
}
