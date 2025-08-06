import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get settings from SQLite
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();
    const settings = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        tournament_registration_active: false,
        tournament_registration_mode: 'manual',
        tournament_open_date: '',
        tournament_close_date: '',
        tournament_closed_message: 'Registration is currently closed. Please check back later.',
        course_registration_active: true,
        coming_soon_message: "Coming Soon! New tournament season starting soon."
      });
    }

    return NextResponse.json({
      tournament_registration_active: Boolean(settings.tournament_registration_active),
      tournament_registration_mode: settings.tournament_registration_mode || 'manual',
      tournament_open_date: settings.tournament_open_date || '',
      tournament_close_date: settings.tournament_close_date || '',
      tournament_closed_message: settings.tournament_closed_message || 'Registration is currently closed. Please check back later.',
      course_registration_active: Boolean(settings.course_registration_active),
      coming_soon_message: settings.coming_soon_message || "Coming Soon! New tournament season starting soon."
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

    // Update settings in SQLite
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Check if settings exist
    const existing = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();

    if (existing) {
      // Update existing settings
      db.prepare(`
        UPDATE admin_settings
        SET tournament_registration_active = ?, tournament_registration_mode = ?,
            tournament_open_date = ?, tournament_close_date = ?, tournament_closed_message = ?,
            course_registration_active = ?, coming_soon_message = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        tournament_registration_active ? 1 : 0,
        tournament_registration_mode || 'manual',
        tournament_open_date || '',
        tournament_close_date || '',
        tournament_closed_message || 'Registration is currently closed. Please check back later.',
        course_registration_active ? 1 : 0,
        coming_soon_message || "Coming Soon! New tournament season starting soon.",
        existing.id
      );
    }

    // Get updated settings
    const updatedSettings = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();

    return NextResponse.json({
      success: true,
      message: 'Page status updated successfully',
      tournament_registration_active: Boolean(updatedSettings.tournament_registration_active),
      tournament_registration_mode: updatedSettings.tournament_registration_mode || 'manual',
      tournament_open_date: updatedSettings.tournament_open_date || '',
      tournament_close_date: updatedSettings.tournament_close_date || '',
      tournament_closed_message: updatedSettings.tournament_closed_message || 'Registration is currently closed. Please check back later.',
      course_registration_active: Boolean(updatedSettings.course_registration_active),
      coming_soon_message: updatedSettings.coming_soon_message || "Coming Soon! New tournament season starting soon."
    });
  } catch (error) {
    console.error('Error updating page status:', error);
    return NextResponse.json(
      { error: 'Failed to update page status' },
      { status: 500 }
    );
  }
}
